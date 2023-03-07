import { useMoralis } from "react-moralis"
export default function DexV1EthToToken({ onClick, setTokenAmount, tokenAmount, expectedTokens }) {
    const { isWeb3Enabled, chainId, account } = useMoralis()

    function handleEthChange(e) {
        if (/^\d+\.*(\d+)*$/.test(e.target.value)) {
            setTokenAmount(e.target.value)
        } else if (e.target.value == "") {
            setTokenAmount(0)
        }
    }
    return (
        <div>
            <div className="w-full max-w-xs hover:bg-slate-300">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <h1 class="flex items-center text-l font-bold dark:text-Black mb-4">
                        <span class="bg-blue-100 text-blue-800 text-l font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ">
                            ETH / DEX
                        </span>
                        Exchange
                    </h1>
                    <div className="mb-4">
                        <input
                            onChange={handleEthChange}
                            value={tokenAmount ? tokenAmount : ""}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="number"
                            placeholder="ETH amount to exchange"
                        />
                    </div>
                    <div className="block text-gray-700 text-sm font-bold mb-1">
                        Tokens Returned{" "}
                    </div>

                    <div className="bg-indigo-400 my-1 text-white font-bold py-2 px-4 rounded-full mb-5">
                        {expectedTokens} DEX
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClick}
                            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                        >
                            Exchange
                        </button>
                    </div>
                </form>
                <p className="text-center text-gray-500 text-xs"></p>
            </div>
        </div>
    )
}
