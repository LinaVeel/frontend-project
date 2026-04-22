import { Component, type ReactNode } from 'react'
import ErrorMessage from './ErrorMessage'

type Props = {
  children: ReactNode
  message?: string
}

type State = {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // intentionally empty: could be wired to logging service
  }

  private reset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage message={this.props.message ?? 'Ошибка отображения'} onRetry={this.reset} />
    }

    return this.props.children
  }
}
