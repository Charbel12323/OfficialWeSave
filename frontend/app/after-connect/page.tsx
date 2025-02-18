"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AfterConnectPage() {
  const [status, setStatus] = useState("Finishing bank connection...")
  const router = useRouter()

  useEffect(() => {
    const finalizeConnection = async () => {
      try {
        // 1. Get Firebase UID from localStorage
        const firebaseUid = localStorage.getItem("firebaseUid")
        if (!firebaseUid) {
          setStatus("No Firebase UID found in local storage.")
          return
        }

        // 2. Fetch user’s Salt Edge connections
        const getConnectionsRes = await fetch(
          `http://localhost:5000/saltedge/get-connections?firebase_uid=${firebaseUid}`
        )
        if (!getConnectionsRes.ok) {
          throw new Error("Failed to fetch connections.")
        }
        const connectionsData = await getConnectionsRes.json()

        // Salt Edge returns an array of connections in connectionsData.data
        const connections = connectionsData.data || []
        if (connections.length === 0) {
          setStatus("No connections found for this user.")
          return
        }

        // 3. Store each connection in Firestore by calling /saltedge/store-connection
        //    (Only needed if you want them in the user's Firestore doc).
        for (const conn of connections) {
          const storeConnRes = await fetch("http://localhost:5000/saltedge/store-connection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firebase_uid: firebaseUid,
              connection: conn,
            }),
          })
          if (!storeConnRes.ok) {
            throw new Error("Failed to store connection in Firestore.")
          }
        }

        // 4. Everything is done; redirect to the dashboard
        setStatus("Bank connection stored! Redirecting to your dashboard...")
        setTimeout(() => {
          router.push("/mainpage")
        }, 1500)
      } catch (err) {
        console.error(err)
        setStatus("Error finalizing bank connection. Check the console logs.")
      }
    }

    finalizeConnection()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-teal-700 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-8 w-full max-w-md text-center text-white">
        <h2 className="text-2xl font-bold mb-4">After Connect</h2>
        <p>{status}</p>
      </div>
    </div>
  )
}
