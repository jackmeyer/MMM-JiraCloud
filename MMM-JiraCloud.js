/* Magic Mirror
 * Module: MMM-JiraCloud
 *
 * By jackmeyer
 * MIT Licensed.
 */

Module.register('MMM-JiraCloud', {

    defaults: {
        reloadInterval: 1000 * 60 * 30, //every 30 minutes
        size: 'small',
        showAssigneeName: false,
    },

    start() {
        Log.info(`Starting module: ${this.name}`);
        this.sendSocketNotification('CONFIG', this.config);
    },

    suspend() {
        this.sendSocketNotification('SUSPEND', this.config);
    },

    resume() {
        this.sendSocketNotification('CONFIG', this.config);
    },

    socketNotificationReceived(notification, payload) {
        if(notification === 'BOARD_UPDATE') {
            this.statusList = payload;
            console.log(payload);
        }
        else if(notification === 'ISSUES_UPDATE') {
            this.issueList = payload;
            console.log(payload);
        } 
        this.updateDom();
    },
})