import { Component } from 'react'

// Catches render/runtime errors so the app shows a message instead of a blank white page.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('PETROGEL portal crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'sans-serif', color: '#18232c' }}>
          <h1>Something went wrong</h1>
          <p>The PETROGEL portal hit an unexpected error while rendering.</p>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#b42318' }}>{this.state.error.message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
