import { io, Socket } from 'socket.io-client'

export const useSocket = () => {
    const config = useRuntimeConfig()
    const { $toast: toast } = useNuxtApp()

    const socketState = useState<Socket | null>('socket_instance', () => null)

    const connect = (companyId: string | null = null) => {
        if (socketState.value?.connected) {
            if (companyId) socketState.value.emit('join_company', companyId)
            return
        }

        const url = (config.public.apiBase as string).replace('/api', '')
        socketState.value = io(url, {
            transports: ['polling', 'websocket'],
            path: '/socket.io'
        })

        socketState.value.on('connect', () => {
            if (companyId) socketState.value?.emit('join_company', companyId)
        })

        socketState.value.on('notification', (data: {
            type: string
            from?: string
            message?: string
            by?: string
            status?: string
        }) => {
            if (data.type === 'new_offer') {
                toast.info(`Yeni Teklif: ${data.from} firmasından mesaj var! \n"${data.message || ''}"`, { timeout: 5000 })
            } else if (data.type === 'offer_update') {
                const statusMap: Record<string, string> = { accepted: 'Kabul Edildi', rejected: 'Reddedildi' }
                toast.success(`Teklif Güncellemesi: ${data.by || 'Firma'} teklifi ${statusMap[data.status ?? ''] || data.status} işaretledi.`)
            } else if (data.type === 'trade_completed') {
                toast.success('Takas Tamamlandı! İşlemleriniz başarıyla sonuçlandı.')
            }
        })

        socketState.value.on('disconnect', () => {
            console.log('Socket disconnected')
        })
    }

    const disconnect = () => {
        if (socketState.value) {
            socketState.value.disconnect()
            socketState.value = null
        }
    }

    return { socket: socketState, connect, disconnect }
}
