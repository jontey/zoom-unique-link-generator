import { Backdrop, CircularProgress } from '@material-ui/core'
import axios from 'axios'
import { SnackbarProvider } from 'notistack'
import { Provider } from 'react-redux'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import { useStore } from '../src/store'
import setupAxios from '../src/utils/request'

function App({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState)
  const persistor = persistStore(store, {}, function () {
    persistor.persist()
  })
  setupAxios(axios, store)

  return (
    <Provider store={store}>
      <PersistGate loading={<Backdrop open={true}><CircularProgress/></Backdrop>} persistor={persistor}>
        <SnackbarProvider>
          <Component {...pageProps} />
        </SnackbarProvider>
      </PersistGate>
    </Provider>
  )
}

export default App