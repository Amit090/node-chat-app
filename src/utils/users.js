const users = []

//Add User
const addUser = ({id, userName, room}) => {
    //clean the data
    userName = userName.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate the data 
    if(!userName || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.userName === userName
    })
   
    //validate user
    if(existingUser){
        return {
            error: 'username is in use!'
        }
    }

    //store users
    const user = {id, userName, room}
    users.push(user)
    return { user }
}

//Remove User
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index!=-1){
        return users.splice(index, 1)[0]

    }
}


//Get User
const getUser = (id) => {
    const userDetails = users.find((user) => {
        return user.id === id
    })
    return userDetails
}

//Get users in room
const getUsersInRoom = (room) => {
    const userDetails = users.filter((user) => {
        return user.room === room
    })
    return userDetails
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}