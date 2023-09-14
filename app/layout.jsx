"use client";

import Moralis from "moralis-v1";
import "./globals.css";
import { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

// const config = useConfig()

// export const metadata = {
// 	title: "TokenLock",
// 	description: "Safest Savings App On the Planet...",
// };

export default function RootLayout({ children }) {
	return (
		<>
			{/* // <QueryClientProvider client={queryClient}> */}
			<html lang="en">
				<body className={inter.className}>{children}</body>
			</html>
		</>
		//  </QueryClientProvider>
	);
}
