import { Provider } from 'react-redux'
import  { useStore } from '../src/store'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'

function App({ Component, pageProps }) {
  const store = useStore(pageProps.initialReduxState)
  const persistor = persistStore(store, {}, function () {
    persistor.persist()
  })

  return (
    <Provider store={store}>
      <PersistGate loading={<div>loading</div>} persistor={persistor}>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  )
}

export default App