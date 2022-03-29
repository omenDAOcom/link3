import '../styles/globals.css'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import TopBar from '../components/top_bar'
import { ToastProvider } from 'react-toast-notifications';


const NearProvider = dynamic(() => import('../context/near') as any, { ssr: false })

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <div className='min-h-screen'>
                <ToastProvider
                    placement='bottom-center'
                    autoDismiss={true}
                    autoDismissTimeout={2000}
                >
                    <NearProvider>
                        <TopBar />
                        <Component {...pageProps} />
                    </NearProvider>
                </ToastProvider>
            </div>
        </>
    )
}

export default MyApp
