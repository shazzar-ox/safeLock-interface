"use client";

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
				<body className="bg-gradient-to-r from-cyan-500 via-cyan-500 to-blue-500 ">
					{children}
				</body>
			</html>
		</>
		//  </QueryClientProvider>
	);
}
