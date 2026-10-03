import Capacitor
import EventKit
import EventKitUI
import Foundation
import UIKit

@objc(WRNDevicePlugin)
public final class WRNDevicePlugin: CAPPlugin, CAPBridgedPlugin, EKEventEditViewDelegate {
    public let identifier = "WRNDevicePlugin"
    public let jsName = "WRNDevice"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "print", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "addCalendarEvent", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "exportFile", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "fetchAsset", returnType: CAPPluginReturnPromise)
    ]
    private let eventStore = EKEventStore()
    private var calendarCall: CAPPluginCall?
    private var printing = false
    private var downloads: [UUID: WRNAssetDownloader] = [:]

    @objc func fetchAsset(_ call: CAPPluginCall) {
        guard let value = call.getString("url"), let url = URL(string: value),
              url.scheme == "https", url.host != nil, url.user == nil, url.password == nil else {
            call.reject("Invalid asset URL", "INVALID_URL"); return
        }
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { call.reject("App unavailable", "UNAVAILABLE"); return }
            guard self.downloads.count < 3 else { call.reject("Another asset download is in progress", "BUSY"); return }
            let id = UUID()
            let downloader = WRNAssetDownloader { [weak self] result in
                DispatchQueue.main.async {
                    self?.downloads.removeValue(forKey: id)
                    switch result {
                    case .success(let asset): call.resolve(["base64": asset.data.base64EncodedString(), "contentType": asset.type])
                    case .failure(let error): call.reject("Asset could not be saved", "ASSET_FAILED", error)
                    }
                }
            }
            self.downloads[id] = downloader
            downloader.start(url)
        }
    }

    @objc func print(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let webView = self.bridge?.webView,
                  let presenter = self.bridge?.viewController else {
                call.reject("Print service unavailable", "UNAVAILABLE"); return
            }
            guard !self.printing, presenter.presentedViewController == nil else {
                call.reject("Another system dialog is open", "BUSY"); return
            }
            guard UIPrintInteractionController.isPrintingAvailable else {
                call.reject("Printing unavailable", "UNAVAILABLE"); return
            }
            let controller = UIPrintInteractionController.shared
            let info = UIPrintInfo(dictionary: nil)
            info.jobName = String((call.getString("jobName") ?? "World Revolution News").prefix(80))
            info.outputType = .general
            controller.printInfo = info
            controller.printFormatter = webView.viewPrintFormatter()
            self.printing = true
            let completion: UIPrintInteractionController.CompletionHandler = { _, completed, error in
                self.printing = false
                if let error = error { call.reject("Printing failed", "PRINT_FAILED", error) }
                else { call.resolve(["completed": completed]) }
            }
            let shown: Bool
            if UIDevice.current.userInterfaceIdiom == .pad {
                shown = controller.present(from: CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.midY, width: 1, height: 1), in: presenter.view, animated: true, completionHandler: completion)
            } else {
                shown = controller.present(animated: true, completionHandler: completion)
            }
            if !shown { self.printing = false; call.reject("Print dialog unavailable", "UNAVAILABLE") }
        }
    }

    @objc func addCalendarEvent(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self, let presenter = self.bridge?.viewController else {
                call.reject("Calendar unavailable", "UNAVAILABLE"); return
            }
            guard self.calendarCall == nil, presenter.presentedViewController == nil else {
                call.reject("Another system dialog is open", "BUSY"); return
            }
            guard let start = call.getDouble("start"), start.isFinite,
                  start > 0, start < 8640000000000000 else {
                call.reject("Invalid event date", "INVALID_DATE"); return
            }
            let end = call.getDouble("end") ?? start + 3600000
            guard end.isFinite, end < 8640000000000000 else {
                call.reject("Invalid event date", "INVALID_DATE"); return
            }
            let event = EKEvent(eventStore: self.eventStore)
            event.title = String((call.getString("title") ?? "World Revolution News").prefix(500))
            event.notes = String((call.getString("description") ?? "").prefix(4000))
            event.location = String((call.getString("location") ?? "").prefix(500))
            event.startDate = Date(timeIntervalSince1970: start / 1000)
            event.endDate = Date(timeIntervalSince1970: max(start + 60000, end) / 1000)
            if let text = call.getString("url"), let url = URL(string: text), url.scheme == "https" {
                event.url = url
            }
            let editor = EKEventEditViewController()
            editor.eventStore = self.eventStore
            editor.event = event
            editor.editViewDelegate = self
            self.calendarCall = call
            // iOS 17+ renders this editor out of process, with no calendar-read grant.
            presenter.present(editor, animated: true)
        }
    }

    public func eventEditViewController(_ controller: EKEventEditViewController, didCompleteWith action: EKEventEditViewAction) {
        let call = calendarCall
        calendarCall = nil
        controller.dismiss(animated: true) { call?.resolve(["saved": action == .saved]) }
    }

    @objc func exportFile(_ call: CAPPluginCall) {
        guard let encoded = call.getString("base64"), encoded.utf8.count <= 24 * 1024 * 1024,
              let data = Data(base64Encoded: encoded), data.count <= 16 * 1024 * 1024 else {
            call.reject("Invalid or oversized export", "INVALID_EXPORT"); return
        }
        let requested = call.getString("filename") ?? "wrn-export.txt"
        let name = String(requested.filter { $0.isLetter || $0.isNumber || $0 == "." || $0 == "-" || $0 == "_" }.prefix(150))
        guard !name.isEmpty, name != ".", name != ".." else {
            call.reject("Invalid export filename", "INVALID_EXPORT"); return
        }
        DispatchQueue.main.async { [weak self] in
            guard let presenter = self?.bridge?.viewController, presenter.presentedViewController == nil else {
                call.reject("Another system dialog is open", "BUSY"); return
            }
            let directory = FileManager.default.temporaryDirectory.appendingPathComponent("wrn-export-" + UUID().uuidString, isDirectory: true)
            let file = directory.appendingPathComponent(name)
            do {
                try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
                try data.write(to: file, options: [.atomic, .completeFileProtection])
            } catch {
                try? FileManager.default.removeItem(at: directory)
                call.reject("Export could not be prepared", "EXPORT_FAILED", error); return
            }
            let sheet = UIActivityViewController(activityItems: [file], applicationActivities: nil)
            sheet.completionWithItemsHandler = { _, completed, _, error in
                try? FileManager.default.removeItem(at: directory)
                if let error = error { call.reject("Export failed", "EXPORT_FAILED", error) }
                else if !completed { call.reject("Export cancelled", "CANCELLED") }
                else { call.resolve(["completed": true]) }
            }
            sheet.popoverPresentationController?.sourceView = presenter.view
            sheet.popoverPresentationController?.sourceRect = CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.midY, width: 1, height: 1)
            presenter.present(sheet, animated: true)
        }
    }
}

// Only explicit offline actions invoke this downloader. No cookies or credentials;
// reject unsupported media and enforce the byte limit while streaming, not afterwards.
private final class WRNAssetDownloader: NSObject, URLSessionDataDelegate {
    struct Asset { let data: Data; let type: String }
    private let completion: (Result<Asset, Error>) -> Void
    private var bytes = Data()
    private var contentType = ""
    private var session: URLSession?
    private var finished = false
    private let limit = 8 * 1024 * 1024
    init(completion: @escaping (Result<Asset, Error>) -> Void) { self.completion = completion }
    func start(_ url: URL) {
        let configuration = URLSessionConfiguration.ephemeral
        configuration.httpCookieStorage = nil
        configuration.urlCache = nil
        configuration.timeoutIntervalForRequest = 20
        configuration.timeoutIntervalForResource = 30
        session = URLSession(configuration: configuration, delegate: self, delegateQueue: nil)
        session?.dataTask(with: url).resume()
    }
    private func fail(_ reason: String) {
        finish(.failure(NSError(domain: "WRNAsset", code: 1, userInfo: [NSLocalizedDescriptionKey: reason])))
    }
    private func finish(_ result: Result<Asset, Error>) {
        guard !finished else { return }; finished = true
        session?.invalidateAndCancel(); session = nil
        completion(result)
    }
    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive response: URLResponse, completionHandler: @escaping (URLSession.ResponseDisposition) -> Void) {
        guard let response = response as? HTTPURLResponse, response.statusCode == 200,
              response.url?.scheme == "https", response.expectedContentLength <= Int64(limit) else {
            completionHandler(.cancel); fail("Invalid or oversized asset response"); return
        }
        contentType = response.mimeType ?? ""
        guard (contentType.hasPrefix("image/") && contentType != "image/svg+xml")
                || contentType == "application/json" else {
            completionHandler(.cancel); fail("Unsupported asset type"); return
        }
        completionHandler(.allow)
    }
    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) {
        if bytes.count + data.count > limit { fail("Asset size limit exceeded"); return }
        bytes.append(data)
    }
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let error = error { finish(.failure(error)) }
        else { finish(.success(Asset(data: bytes, type: contentType))) }
    }
    func urlSession(_ session: URLSession, task: URLSessionTask, willPerformHTTPRedirection response: HTTPURLResponse, newRequest request: URLRequest, completionHandler: @escaping (URLRequest?) -> Void) {
        guard request.url?.scheme == "https", request.url?.user == nil, request.url?.password == nil else {
            completionHandler(nil); fail("Unsafe redirect"); return
        }
        completionHandler(request)
    }
}
