//yarn add web3uikit moralis react-moralis
//import it on app.js and surround app with MoralisProvider tags
//https://tailwindcss.com/docs/guides/nextjs  follow tailwind next js install
import { ConnectButton } from "web3uikit"
import Link from "next/link"
import Image from "next/image"
import sphereImage from "../img/sphere.png"

export default function Header() {
    return (
        <nav
            className="p-5 border-b-2 flex flex-row justify-between items-center "
            onMouseOver={() => console.log("hover over header")}
        >
            <div className="flex justify-center items-center">
                <Link href="/">
                    <div className="flex justify-center items-center cursor-pointer ">
                        <Image
                            src={sphereImage}
                            className="py-4 px-4 font-bold text-3xl "
                            height="90"
                            width="90"
                        />

                        <a className=" py-4 px-4 text-white font-bold   justify-left font-mono text-3xl ">
                            D E X
                        </a>
                    </div>
                </Link>
            </div>

            <div className="flex flex-row items-center">
                <Link href="/Multi-Sig">
                    <a className="mr-4 p-6 font-bold text-lg text-white">Get some DEX tokens!</a>
                </Link>
                <Link href="/">
                    <a className="mr-4 p-6 font-bold"> </a>
                </Link>
                <Link href="/">
                    <a className="mr-4 p-6 font-bold"> </a>
                </Link>

                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    )
}
