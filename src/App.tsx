import React from 'react'
import SimpleDemo from "./Excel/SimpleDemo";
import styles from "./App.module.scss"
import MultiHeader from "./Excel/MultiHeader";

interface AppProps {
}

const App: React.FC<AppProps> = () => {
  return (
    <div className={styles.container}>
      <SimpleDemo/>
      <MultiHeader />
    </div>
  )
}

export default App
