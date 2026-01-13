import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[AI Tutor Module Error]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 24,
            background: "#1C1C1C",
            color: "#fff",
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <h2>Что-то пошло не так :/</h2>
          <p>Попробуйте обновить страницу или обратиться в поддержку.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
