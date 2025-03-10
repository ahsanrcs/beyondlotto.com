import React from "react";
import styled from "styled-components";

const FormInput = styled.input`
	width: 100%;
	font-size: 12px;
	padding: 17px 15px;
	border-radius: 5px;
	border: 2px solid #e8ede9;
	outline: none;

	&:focus,
	&:hover {
		border-color: var(--light-green-color);
	}
`;

const Input = ({ type, placeholder, name, id }) => {
	return (
		<FormInput type={type} name={name} id={id} placeholder={placeholder} />
	);
};

export default Input;
