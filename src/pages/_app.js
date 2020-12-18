import { useStore } from '@/store'
import { Auth0Provider } from '@auth0/auth0-react'
import { Backdrop, CircularProgress } from '@material-ui/core'
import { SnackbarProvider } from 'notistack'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import Router from 'next/router'

function App({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState)
  const persistor = persistStore(store, {}, function () {
    persistor.persist()
  })

  const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
  const REDIRECT_URL = process.env.NEXT_PUBLIC_APP_REDIRECT_URL

  const onRedirectCallback = (appState) => {
    Router.replace(appState?.returnTo || '/')
  }

  return (
    <Auth0Provider
      domain="jtey1.us.auth0.com"
      audience="https://app.stnl.my/api"
      scope="read:users"
      clientId={CLIENT_ID}
      redirectUri={REDIRECT_URL}
      onRedirectCallback={onRedirectCallback}
    >
      <Provider store={store}>
        <PersistGate loading={<Backdrop open={true}><CircularProgress/></Backdrop>} persistor={persistor}>
          <SnackbarProvider>
            <Component {...pageProps} />
          </SnackbarProvider>
        </PersistGate>
      </Provider>
    </Auth0Provider>
  )
}

export default App