import AVFoundation
import Capacitor
import UIKit

@objc(WRNViewController)
final class WRNViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(WRNDevicePlugin())
        // Playback only: never activate the microphone or start audio automatically.
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        view.backgroundColor = .black
        webView?.isOpaque = false
        webView?.backgroundColor = .black
    }

    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }
}
