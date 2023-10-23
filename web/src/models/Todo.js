export default class Todo {
    constructor(
        taskId,
        userId,
        crationDate,
        message,
        dueDate,
        status,
        reminder,
        senderUrl
    ) {
        this.taskId = taskId;
        this.userId = userId;
        this.crationDate = crationDate;
        this.message = message;
        this.dueDate = dueDate;
        this.status = status;
        this.reminder = reminder;
        this.senderUrl = senderUrl;
    }

    static from(json) {
        return new Todo(
            json.taskid,
            json.userid,
            json.creationdate,
            json.message,
            json.duedate,
            json.status,
            json.reminder,
            json.senderurl,
        )
    }
}