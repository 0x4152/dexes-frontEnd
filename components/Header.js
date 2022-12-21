//yarn add web3uikit moralis react-moralis
//import it on app.js and surround app with MoralisProvider tags
//https://tailwindcss.com/docs/guides/nextjs  follow tailwind next js install
import { ConnectButton } from "web3uikit"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
            <h1 className="py-4 px-4 font-bold text-3xl">NFT Bazaar</h1>
            <div className="flex flex-row items-center">
                <Link href="/">
                    <a className="mr-4 p-6 font-bold"> Buy </a>
                </Link>
                <Link href="/">
                    <a className="mr-4 p-6 font-bold"> Sell </a>
                </Link>
                <Link href="/">
                    <a className="mr-4 p-6 font-bold"> Withdraw proceeds </a>
                </Link>

                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
