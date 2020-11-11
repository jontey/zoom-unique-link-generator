import { Provider } from 'react-redux'
import  { useStore } from '../src/store'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import axios from 'axios'
import setupAxios from '../src/utils/request'

import { Backdrop, CircularProgress } from '@material-ui/core'

function App({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState)
  const persistor = persistStore(store, {}, function () {
    persistor.persist()
  })
  setupAxios(axios, store)

  return (
    <Provider store={store}>
      <PersistGate loading={<Backdrop open={true}><CircularProgress/></Backdrop>} persistor={persistor}>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  )
}

export default App