import { useState, useEffect } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"

import { useWeb3Contract, useMoralis } from "react-moralis"
import WETHabi from "../constants/WETHabi.json"
import WBTCabi from "../constants/WBTC.json"
import { ethers } from "ethers"
export default function DexV1TokenToEth({
    onClick,
    setTokenAmount,
    tokenAmount,
    expectedEth,
    exchangeDepositTokenAmount,
    setExchangeDepositTokenAmount,
    onExchangeApproveClick,
    tokensToApproveExchange,
    onExchangeDepositClick,
}) {
    const { isWeb3Enabled, chainId, account } = useMoralis()

    function handleTokenChange(e) {
        if (/^\d+\.*(\d+)*$/.test(e.target.value)) {
            setTokenAmount(e.target.value)
        } else if (e.target.value == "") {
            setTokenAmount("0.1")
        }
    }

    return (
        <div>
            <div class="w-full max-w-xs hover:bg-slate-300">
                <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Tokens to ETH
                        </label>
                        <input
                            onChange={handleTokenChange}
                            value={tokenAmount ? tokenAmount : ""}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="0.0"
                        />
                    </div>
                    <div className="block text-gray-700 text-sm font-bold mb-2">Eth returned </div>
                    <div className="m-2">{expectedEth} ETH</div>

                    <div class="flex items-center justify-between">
                        {tokensApproved >= tokensToApproveExchange && tokensApproved > 0 ? (
                            <button
                                onClick={onExchangeDepositClick}
                                class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
