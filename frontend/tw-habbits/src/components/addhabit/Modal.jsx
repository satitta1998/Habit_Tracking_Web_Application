/** 
 * Modal Component
 * Reusable popup diaglog. Collects inputs for adding a new habit (title and color).
*/


import React from "react";

// For local development
const API_BASE_URL = "http://localhost:3000";

// For production, switch to deployed URL
//const API_BASE_URL = "https://braude-habbits-v2-hksm.vercel.app";

const Modal = ({isOpen, close, inputs, title, width = 300, onSubmit, children}) => {
    const handleBackgroundClickClose = (event) =>
        event.target.classList.contains('modal') && close();
    return (
        isOpen ? (
            <>
                <div onClick={handleBackgroundClickClose}
                     className="modal flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#00000099]">
                    <form onSubmit={event => {
                        event.preventDefault();
                        const formData = new FormData(event.target);
                        const data = {};
                        for (const input of inputs) {
                            data[input] = formData.get(input);
                        }
                        console.log("Debug: data = ", data)

                        fetch(`${API_BASE_URL}/add_habit?id=${localStorage.getItem("userID")}&habitName=${encodeURIComponent(data['title'])}&color=${encodeURIComponent(data['color'])}`)
                        .then(response => {
                            if (response.ok) {
                                console.log('Fetch successful');
                                
                                return fetch(`${API_BASE_URL}/get_user_habits?id=${localStorage.getItem("userID")}`);
                            } else {
                                throw new Error('Network response was not ok');
                            }
                        })
                        .then(response2 => response2.json())
                        .then(updatedHabits => {
                            onSubmit(updatedHabits);
                            close();
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });

                        close();
                    }} className="relative w-auto my-6 mx-auto " style={{width}}>
                        <div
                            className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none dark:bg-purple-900">
                            <div
                                className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
                                <h3 className="dark:text-white text-3xl font=semibold">{title}</h3>
                                <button
                                    className="bg-transparent border-0 text-gray-400 float-right text-2xl"
                                    onClick={close}
                                >x
                                </button>
                            </div>
                            <div className="relative p-6 flex-auto">
                                {children}
                            </div>
                            <div
                                className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                                <button
                                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                                    type="button"
                                    onClick={close}
                                >
                                    Close
                                </button>
                                <button
                                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                                    type="submit">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </>
        ) : null
    );
};

export default Modal;