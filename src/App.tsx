import React from 'react'
import SimpleDemo from "./Excel/SimpleDemo";
import styles from "./App.module.scss"

interface AppProps {
}

const App: React.FC<AppProps> = () => {
  return (
    <div className={styles.container}>
      <SimpleDemo/>
    </div>
  )
}

export default App
