import React from 'react'

export default function Sender( params ) {
    if (params.senderUrl === null) {
        return null;
    }

    return (
        <div>Sent by <a href={`https://t.me/${params.senderUrl}`}>{params.senderUrl}</a></div>
    )
}
