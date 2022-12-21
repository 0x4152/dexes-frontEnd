import { useState } from "react"
import { Input, Modal, useNotification, Card } from "web3uikit"
////////////////////////////////////////////////////////////////////////////////////////////////////////////
//When we apply useNotification, we need to also import a NotificationProvider on _app.js for it to work
//import { NotificationProvider } from "web3uikit"
////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { useWeb3Contract } from "react-moralis"
import YeahTokenAbi from "../constants/YEAHabi.json"
import { ethers } from "ethers"

export default function UpdateListingModal({ YeahTokenAddress, DexAddress, isVisible, onClose }) {
    const [tokenAmountToApprove, setTokenAmountToApprove] = useState(0)
    const dispatch = useNotification()

    /////////////////////////////////////////////////////////////////
    //this function will be called on success after making the smart contract call to update listing
    // its important that the smart contract call always returns the transaction, therefore we can use wait
    // we can also access other data from the transaction
    /////////////////////////////////////////////////////////////////
    async function handleUpdateListingSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Transaction sent",
            title: "Approve Transaction sent, wait for block to be mined",
            position: "topR",
        })
        onClose && onClose()
        setPriceToUpdateListingWith("0")
    }

    const { runContractFunction: approve } = useWeb3Contract({
        abi: YeahTokenAbi,
        contractAddress: YeahTokenAddress,
        functionName: "approve",
        params: {
            nftAddress: DexAddress,
            amount: ethers.utils.parseEther(tokenAmountToApprove.toString()),
        },
    })

    return (
        <Modal
            isVisible={isVisible}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
            onOk={() => {
                console.log("running contract function approve")
                approve({
                    onError: (error) => {
                        console.log(error)
                    },
                    onSuccess: (tx) => handleUpdateListingSuccess(tx),
                })
            }}
        >
            <div className="m-4 flex p-4 place-content-center gap-x-52">
                <div>
                    Token amount you want to approve
                    <Input
                        label="0"
                        type="number"
                        name="Yeah tokens to approve"
                        onChange={(event) => {
                            setTokenAmountToApprove(event.target.value)
                        }}
                    ></Input>
                </div>
            </div>
        </Modal>
    )
}
