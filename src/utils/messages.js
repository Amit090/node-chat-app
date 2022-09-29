const generatedMessage = (userName, text) =>  {
    return {
        userName,
        text,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generatedMessage
}