import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Head from "next/head"
import { NotificationProvider } from "web3uikit"

//import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
//const client = new ApolloClient({
//cache: new InMemoryCache(),
//uri: "https://api.studio.thegraph.com/query/37227/bazaar-goerli/v0.0.4", //subrgaphAPI/details window deployment query url
//})
function MyApp({ Component, pageProps }) {
    return (
        <div class="bg-back bg-fixed">
            <Head>
                <title>Dexes</title>
                <meta name="description" content="Decentralized exchanges" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <MoralisProvider initializeOnMount={false}>
                <NotificationProvider>
                    <Header />

                    <Component {...pageProps} />
                </NotificationProvider>
            </MoralisProvider>
        </div>
    )
}

export default MyApp
