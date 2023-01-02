import { useState, useEffect } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"

import { useWeb3Contract, useMoralis } from "react-moralis"
import WETHabi from "../constants/WETHabi.json"
import WBTCabi from "../constants/WBTC.json"
import { ethers } from "ethers"
export default function DexV1TokenToEth({ onClick, setTokenAmount, tokenAmount, expectedEth }) {
    const { isWeb3Enabled, chainId, account } = useMoralis()

    function handleTokenChange(e) {
        setTokenAmount(e.target.value)
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
                            value={tokenAmount}
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="0.0"
                        />
                    </div>
                    <div className="block text-gray-700 text-sm font-bold mb-2">Eth returned </div>
                    <div className="m-2">{expectedEth}</div>

                    <div class="flex items-center justify-between">
                        <button
                            onClick={() => onClick}
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                        >
                            Exchange
                        </button>
                    </div>
                </form>
                <p class="text-center text-gray-500 text-xs"></p>
            </div>
        </div>
    )
}
