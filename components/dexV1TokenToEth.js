import { Alert } from "@mui/material"
import { useMoralis } from "react-moralis"
export default function DexV1TokenToEth({
    setTokenAmount,
    tokenAmount,
    expectedEth,
    onExchangeApproveClick,
    tokensToApproveExchange,
    onExchangeTokenToEthClick,
    tokensApproved,
}) {
    function handleTokenChange(e) {
        if (/^\d+\.*(\d+)*$/.test(e.target.value)) {
            setTokenAmount(e.target.value)
        } else if (e.target.value == "") {
            setTokenAmount(0)
        }
    }

    return (
        <div>
            <div class="w-full max-w-xs hover:bg-slate-300">
                <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div class="mb-4">
                        <h1 class="flex items-center text-l font-bold dark:text-Black mb-4">
                            <span class="bg-blue-100 text-blue-800 text-l font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800 ">
                                ETH / DEX
                            </span>
                            Exchange
                        </h1>
                        {tokensApproved ? (
                            tokensApproved >= tokensToApproveExchange ? (
                                <Alert severity="success">
                                    You have <strong>{tokensApproved} DEX </strong>approved
                                </Alert>
                            ) : (
                                <div>
                                    <Alert severity="warning">
                                        You have <strong>{" " + tokensApproved + " "} DEX </strong>
                                        approved, not enough for the quantity you want to exchange.
                                    </Alert>
                                    <Alert severity="info">
                                        <p className="m-4">
                                            Click on the approve button to approve this contract to
                                            manipulate
                                            <strong>
                                                {" " + tokensToApproveExchange + " "}DEX{" "}
                                            </strong>
                                            tokens from your account.
                                        </p>
                                    </Alert>
                                </div>
                            )
                        ) : (
                            <Alert severity="info">
                                <p className="m-4">
                                    Click on the approve button to approve this contract to
                                    manipulate{" "}
                                    <strong>
                                        {Number(tokensToApproveExchange).toFixed(8)} DEX tokens{" "}
                                    </strong>
                                    from your account.
                                </p>
                            </Alert>
                        )}
                        <input
                            onChange={handleTokenChange}
                            value={tokenAmount ? tokenAmount : ""}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="number"
                            placeholder="Token amount to exchange"
                        />
                    </div>
                    <div className="block text-gray-700 text-sm font-bold mb-2">Eth returned </div>
                    <div className="bg-indigo-400 my-1 text-white font-bold py-2 px-4 rounded-full mb-5">
                        {expectedEth} ETH
                    </div>

                    <div class="flex items-center justify-between">
                        {tokensApproved >= tokenAmount && tokensApproved > 0 ? (
                            <button
                                onClick={onExchangeTokenToEthClick}
                                class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="button"
                            >
                                Exchange
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowAlertDeposit(true)}
                                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                type="button"
                            >
                                Exchange
                            </button>
                        )}
                        <button
                            onClick={onExchangeApproveClick}
                            class="bg-violet-700 hover:bg-violet-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                        >
                            Approve
                        </button>
                    </div>
                </form>
                <p class="text-center text-gray-500 text-xs"></p>
            </div>
        </div>
    )
}
