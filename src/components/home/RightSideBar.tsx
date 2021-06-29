import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import UserCard from '../UserCard'
import FollowBtn from '../FollowBtn'
import LoadIcon from '../../assets/images/loading.gif'
import { getSuggestions } from '../../Redux/actions/suggestionsAction'

const RightSideBar = () => {
    const { auth, suggestions }: any = useSelector(state => state)
    const dispatch = useDispatch()

    return (
        <div className="mt-3">
            <UserCard user={auth.user} />

            <div className="d-flex justify-content-between align-items-center my-2">
                <h5 className="text-danger">Suggestions for you</h5>
                {!suggestions.loading && (
                    <i
                        className="fas fa-redo"
                        style={{ cursor: 'pointer' }}
                        onClick={() => dispatch(getSuggestions(auth.token))}
                    />
                )}
            </div>

            {suggestions.loading ? (
                <img src={LoadIcon} alt="loading" className="d-block mx-auto my-4" />
            ) : (
                <div className="suggestions">
                    {suggestions.users.map((user: { _id: string }) => (
                        <UserCard key={user._id} user={user}>
                            <FollowBtn user={user} />
                        </UserCard>
                    ))}
                </div>
            )}
        </div>
    )
}

export default RightSideBar
