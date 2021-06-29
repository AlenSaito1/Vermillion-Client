import React, { useState, useEffect } from 'react'
import CommentDisplay from './comments/CommentDisplay'

const Comments = ({ post }: any) => {
    const [comments, setComments] = useState([])
    const [showComments, setShowComments] = useState<{ _id: string }[]>([])
    const [next, setNext] = useState(2)

    const [replyComments, setReplyComments] = useState([])

    useEffect(() => {
        const newCm = post.comments.filter((cm: { reply: string | null }) => !cm.reply)
        setComments(newCm)
        setShowComments(newCm.slice(newCm.length - next))
    }, [post.comments, next])

    useEffect(() => {
        const newRep = post.comments.filter((cm: { reply: string | null }) => cm.reply)
        setReplyComments(newRep)
    }, [post.comments])

    return (
        <div className="comments">
            {showComments.map((comment, index) => (
                <CommentDisplay
                    key={index}
                    comment={comment}
                    post={post}
                    replyCm={replyComments.filter(
                        (item: { reply: string | null }) => item.reply === comment._id
                    )}
                />
            ))}

            {comments.length - next > 0 ? (
                <div
                    className="p-2 border-top"
                    style={{ cursor: 'pointer', color: 'crimson' }}
                    onClick={() => setNext(next + 10)}
                >
                    See more comments...
                </div>
            ) : (
                comments.length > 2 && (
                    <div
                        className="p-2 border-top"
                        style={{ cursor: 'pointer', color: 'crimson' }}
                        onClick={() => setNext(2)}
                    >
                        Hide comments...
                    </div>
                )
            )}
        </div>
    )
}

export default Comments
