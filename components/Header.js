//yarn add web3uikit moralis react-moralis
//import it on app.js and surround app with MoralisProvider tags
//https://tailwindcss.com/docs/guides/nextjs  follow tailwind next js install
import { ConnectButton } from "web3uikit"
import Link from "next/link"
import Image from "next/image"
import sphereImage from "../img/DEX_Logo.svg"

export default function Header() {
    return (
        <nav
            className="px-5 pt-4  flex flex-row justify-between items-center "
            onMouseOver={() => console.log("hover over header")}
        >
            <div className="flex justify-center items-center">
                <Link href="/">
                    <div className="flex justify-center items-center cursor-pointer m-7">
                        <Image src={sphereImage} className=" font-bold text-3xl" />
                    </div>
                </Link>
            </div>

            <div className="flex flex-row items-center w-1/2 justify-between">
                <Link href="/Multi-Sig">
                    <button
                        type="button"
                        class="mt-2 text-purple-700 hover:text-white border border-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-purple-400 dark:text-purple-400 dark:hover:text-white dark:hover:bg-purple-500 dark:focus:ring-purple-900"
                    >
                        Get some DEX tokens!
                    </button>
                </Link>

                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
