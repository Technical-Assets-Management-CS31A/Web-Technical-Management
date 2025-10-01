type SuccessAlertProps = {
    message: string
}

export const SuccessAlert = ({ message }: SuccessAlertProps) => {
    return (
        <div className="absolute top-8 right-4">
            <div
                className={
                    "bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-500 ease-in-out"
                }
            >
                <div className="flex-shrink-0">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <div className="font-semibold text-lg">
                    {message}
                </div>
            </div>
        </div>
    )
}
