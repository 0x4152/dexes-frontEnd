import { useState, useEffect } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"

import { useWeb3Contract, useMoralis } from "react-moralis"
import WETHabi from "../constants/WETHabi.json"
import WBTCabi from "../constants/WBTC.json"
import { ethers } from "ethers"
export default function DexV1EthToToken({ onClick, setTokenAmount, tokenAmount, expectedTokens }) {
    const { isWeb3Enabled, chainId, account } = useMoralis()

    function handleEthChange(e) {
        if (/^\d+\.*(\d+)*$/.test(e.target.value)) {
            setTokenAmount(e.target.value)
        } else if (e.target.value == "") {
            setTokenAmount("0.1")
        }
    }
    return (
        <div>
            <div className="w-full max-w-xs hover:bg-slate-300">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <label
                            className="block text-gray-700 text-sm font-bold mb-2"
                            for="username"
                        >
                            ETH to Tokens
                        </label>
                        <input
                            onChange={handleEthChange}
                            value={tokenAmount ? tokenAmount : ""}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            placeholder="0"
                        />
                    </div>
                    {expectedTokens}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClick}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
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
