import toast from "react-hot-toast";

export const showError = (message = "Error") => {
	toast.error(message, {
		style: {
			backgroundColor: "black",
			fontSize: "0.8rem",
			color: "white",
		},
	});
};

export const showSuccess = (message = "Success") => {
	toast.success(message, {
		style: {
			backgroundColor: "black",
			fontSize: "0.8rem",
			color: "white",
		},
	});
};
