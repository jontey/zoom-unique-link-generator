import Head from 'next/head';

export default function Layout({ children }) {
  return (
    <div>
      <Head>
        <title>Zoom Unique Link Generator</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>
      <div>{children}</div>
    </div>
  )
}