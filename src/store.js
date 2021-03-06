import { useMemo } from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

let store

const defaultState = {
  accessToken: '',
  user: {}
}

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        accessToken: action.accessToken,
        user: action.user
      }
    case 'CLEAR_TOKEN':
      return defaultState
    default:
      return state
  }
}

const persistedReducer = persistReducer({
  key: 'root',
  storage
}, reducer)

function initStore(preloadedState = defaultState) {
  return createStore(
    persistedReducer,
    preloadedState,
    composeWithDevTools(applyMiddleware())
  )
}

export const initializeStore = (preloadedState) => {
  let _store = store ?? initStore(preloadedState)

  // After navigating to a page with an initial Redux state, merge that state
  // with the current state in the store, and create a new store
  if (preloadedState && store) {
    _store = initStore({
      ...store.getState(),
      ...preloadedState
    })
    // Reset the current store
    store = undefined
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store
  // Create the store once in the client
  if (!store) store = _store

  return _store
}

export function useStore(initialState) {
  const store = useMemo(() => initializeStore(initialState), [ initialState ])
  return store
}