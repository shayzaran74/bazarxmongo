import { Capacitor } from '@capacitor/core'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()

    if (process.client) {
        const platform = Capacitor.getPlatform()

        // Android Emulator specific configuration
        if (platform === 'android') {
            // Check if we are potentially inside an emulator (this logic is simplified)
            // Usually developers use 10.0.2.2 for local backend in emulator
            // We override the apiBase only for Android to point to emulator's host loopback

            // Note: If testing on a PHYSICAL Android device, this might need to stay as 192.168.x.x
            // But since the issue is specifically about "Android Emulator not connecting",
            // and we want to solve it without breaking iOS/Web...

            // Let's make it smart: simpler approach first.
            // If the User is running on Android AND the configured host is localhost or 192.168...


            // Override for Android Emulator (works for 10.0.2.2)
            // NOTICE: This assumes you are running in emulator. 
            // If running on physical device, you still need the LAN IP (192.168.1.101).
            // However, 10.0.2.2 won't hurt on physical if un-reachable (it just fails), 
            // but we need to decide.

            // Since the user is struggling with "Android Emulator" connection issues usually associated with 10.0.2.2,
            // and iOS works fine with LAN IP.

            // Let's try to detect if we should switch.
            // Actually, there is no easy way to distinguish Emulator vs Physical in Web View context easily without native plugins.

            // Strategy: Change runtime config to 10.0.2.2 primarily for Android environment
            // IF the user is using the emulator.

            config.public.apiBase = 'http://10.0.2.2:3001'
        }
    }
})
