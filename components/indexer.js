import { useState, useEffect } from "react"

export default function Indexer({
    startingIndexForBlock,
    txCount,
    lastTxIndex,
    inputIndex,
    setInputIndex,
}) {
    const [buttonsArray, setButtonsArray] = useState([0, 1, 2, 3, 4, 5, 6, 7])
    function buttonCalculation() {
        let buttons = []
        let range = lastTxIndex - startingIndexForBlock + 1

        let start = startingIndexForBlock
        for (let i = 0; i < range; i++) {
            buttons.push(start)
            start++
        }
        setButtonsArray(buttons)
    }

    useEffect(() => {
        buttonCalculation()
    }, [inputIndex, lastTxIndex, txCount])

    return (
        <div>
            <div className="w-full max-w-8xl justify-center items-center">
                <form className="">
                    <div className="mb-4 ">
                        {buttonsArray.map((button) => (
                            <button
                                key={button}
                                onClick={() => setInputIndex(button)}
                                class={
                                    inputIndex == button
                                        ? "bg-violet-600 mx-2 hover:bg-violet-800 my-2 text-white font-bold py-3 px-3 rounded focus:outline-none focus:shadow-outline"
                                        : "bg-fuchsia-400 mx-2 hover:bg-fuchsia-600 my-2 text-white font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                                }
                                type="button"
                            >
                                TX {button}
                            </button>
                        ))}
                    </div>
                </form>
                <p className="text-center text-gray-500 text-xs"></p>
            </div>
        </div>
    )
}
