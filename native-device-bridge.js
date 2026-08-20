/* World Revolution News – optional native print, calendar and reminder bridge */
'use strict';

(() => {
  if (window.WRNDeviceBridge) return;

  const plugins = () => window.Capacitor?.Plugins || {};
  const positiveInteger = value => {
    const text = String(value || 'wrn-event');
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) % 2000000000 + 1;
  };

  async function print(jobName = 'World Revolution News') {
    const native = plugins().WRNDevice;
    if (native?.print) {
      await native.print({ jobName: String(jobName).slice(0, 80) });
      return { native: true };
    }
    window.print();
    return { native: false };
  }

  async function addCalendarEvent(event, fallback) {
    const native = plugins().WRNDevice;
    if (native?.addCalendarEvent) {
      await native.addCalendarEvent({
        title: String(event?.title || '').slice(0, 500),
        description: String(event?.content || event?.description || '').slice(0, 4000),
        location: [event?.venue, event?.city, event?.country].filter(Boolean).join(', ').slice(0, 500),
        start: Number(event?.start) || Date.now(),
        end: Number(event?.end) || Number(event?.start) + 60 * 60 * 1000,
        url: String(event?.link || '').slice(0, 1000)
      });
      return { native: true };
    }
    if (typeof fallback === 'function') fallback();
    return { native: false };
  }

  async function scheduleReminder(event, remindAt) {
    const localNotifications = plugins().LocalNotifications;
    if (!localNotifications?.schedule) return { native: false, id: positiveInteger(event?.id) };
    const permissions = await localNotifications.requestPermissions();
    if (permissions?.display !== 'granted') throw new Error('notification-permission-denied');
    const id = positiveInteger(event?.id);
    await localNotifications.schedule({
      notifications: [{
        id,
        title: 'World Revolution News',
        body: [event?.title, event?.city].filter(Boolean).join(' · ').slice(0, 500),
        schedule: { at: new Date(Math.max(Date.now() + 5000, Number(remindAt) || Date.now() + 5000)) },
        extra: { eventId: String(event?.id || ''), link: String(event?.link || '') }
      }]
    });
    return { native: true, id };
  }

  async function cancelReminder(id) {
    const localNotifications = plugins().LocalNotifications;
    if (!localNotifications?.cancel || !Number(id)) return { native: false };
    await localNotifications.cancel({ notifications: [{ id: Number(id) }] });
    return { native: true };
  }

  window.WRNDeviceBridge = Object.freeze({
    print,
    addCalendarEvent,
    scheduleReminder,
    cancelReminder,
    reminderId: positiveInteger
  });
})();
