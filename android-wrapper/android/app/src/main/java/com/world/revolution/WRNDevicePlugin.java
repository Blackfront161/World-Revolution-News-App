package com.world.revolution;

import android.content.Context;
import android.content.Intent;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.CalendarContract;
import android.webkit.WebView;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WRNDevice")
public class WRNDevicePlugin extends Plugin {
    @PluginMethod
    public void print(PluginCall call) {
        String jobName = call.getString("jobName", "World Revolution News");
        getActivity().runOnUiThread(() -> {
            try {
                WebView webView = getBridge().getWebView();
                PrintManager manager = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
                if (webView == null || manager == null) {
                    call.reject("Print service unavailable");
                    return;
                }
                PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(jobName);
                manager.print(jobName, adapter, null);
                call.resolve();
            } catch (Exception error) {
                call.reject("Print dialog could not be opened", error);
            }
        });
    }

    @PluginMethod
    public void addCalendarEvent(PluginCall call) {
        String title = call.getString("title", "World Revolution News");
        String description = call.getString("description", "");
        String location = call.getString("location", "");
        String url = call.getString("url", "");
        long start = call.getLong("start", System.currentTimeMillis());
        long end = call.getLong("end", start + 60L * 60L * 1000L);
        if (!url.isEmpty()) description = description + (description.isEmpty() ? "" : "\n\n") + url;

        try {
            Intent intent = new Intent(Intent.ACTION_INSERT)
                .setData(CalendarContract.Events.CONTENT_URI)
                .putExtra(CalendarContract.Events.TITLE, title)
                .putExtra(CalendarContract.Events.DESCRIPTION, description)
                .putExtra(CalendarContract.Events.EVENT_LOCATION, location)
                .putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, start)
                .putExtra(CalendarContract.EXTRA_EVENT_END_TIME, Math.max(start, end));
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Calendar could not be opened", error);
        }
    }
}
