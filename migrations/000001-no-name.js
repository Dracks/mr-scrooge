'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable "graph_label", deps: []
 * createTable "graph_label_transaction", deps: []
 * createTable "graph_graph", deps: []
 * createTable "graph_group", deps: []
 * createTable "graph_horizontal_group", deps: []
 * createTable "graph_group_labels", deps: []
 * createTable "graph_horizontal_group_labels", deps: []
 * createTable "core_bank_transaction", deps: []
 * createTable "session_user", deps: []
 * createTable "user_group", deps: []
 * createTable "user_group_rel", deps: []
 * createTable "SequelizeMeta", deps: []
 * createTable "session_session", deps: [session_user]
 * addIndex "cursor" to table "core_bank_transaction"
 * addIndex "session_session_created_at" to table "session_session"
 * addIndex "session_session_last_activity" to table "session_session"
 * addIndex "user_group_rel_user_id_user_group_id" to table "user_group_rel"
 *
 **/

var info = {
    "revision": 1,
    "name": "no-name",
    "created": "2023-11-20T11:16:21.785Z",
    "comment": ""
};

var migrationCommands = [{
        fn: "createTable",
        params: [
            "graph_label",
            {
                "id": {
                    "autoIncrement": true,
                    "primaryKey": true,
                    "field": "id",
                    "type": Sequelize.INTEGER
                },
                "groupOwnerId": {
                    "allowNull": false,
                    "field": "group_owner_id",
                    "type": Sequelize.INTEGER
                },
                "name": {
                    "allowNull": false,
                    "field": "name",
                    "type": Sequelize.STRING(255)
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "graph_label_transaction",
            {
                "id": {
                    "autoIncrement": true,
                    "allowNull": false,
                    "primaryKey": true,
                    "field": "id",
                    "type": Sequelize.INTEGER
                },
                "labelId": {
                    "field": "labelId",
                    "type": Sequelize.NUMBER
                },
                "transactionId": {
                    "field": "transactionId",
                    "type": Sequelize.NUMBER
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "graph_graph",
            {
                "id": {
                    "autoIncrement": true,
                    "primaryKey": true,
                    "field": "id",
                    "type": Sequelize.INTEGER
                },
                "groupOwnerId": {
                    "allowNull": false,
                    "field": "group_owner_id",
                    "type": Sequelize.INTEGER
                },
                "name": {
                    "field": "name",
                    "type": Sequelize.STRING(255)
                },
                "kind": {
                    "allowNull": false,
                    "field": "kind",
                    "type": Sequelize.CHAR(3)
                },
                "labelFilter": {
                    "field": "tag_filter",
                    "type": Sequelize.INTEGER
                },
                "dateRange": {
                    "allowNull": false,
                    "field": "date_range",
                    "type": Sequelize.CHAR(10)
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "graph_group",
            {
                "graphId": {
                    "allowNull": false,
                    "primaryKey": true,
                    "field": "graph_id",
                    "type": Sequelize.INTEGER
                },
                "group": {
                    "allowNull": false,
                    "field": "group",
                    "type": Sequelize.CHAR(10)
                },
                "hideOthers": {
                    "field": "hide_others",
                    "type": Sequelize.BOOLEAN
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "graph_horizontal_group",
            {
                "graphId": {
                    "allowNull": false,
                    "primaryKey": true,
                    "field": "graph_id",
                    "type": Sequelize.INTEGER
                },
                "group": {
                    "allowNull": false,
                    "field": "group",
                    "type": Sequelize.CHAR(10)
                },
                "hideOthers": {
                    "field": "hide_others",
                    "type": Sequelize.BOOLEAN
                },
                "accumulate": {
                    "field": "accumulate",
                    "type": Sequelize.BOOLEAN
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "graph_group_labels",
            {
                "graphId": {
                    "primaryKey": true,
                    "field": "graph_id",
                    "type": Sequelize.INTEGER
                },
                "labelId": {
                    "primaryKey": true,
                    "field": "label_id",
                    "type": Sequelize.INTEGER
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "graph_horizontal_group_labels",
            {
                "graphId": {
                    "primaryKey": true,
                    "field": "graph_id",
                    "type": Sequelize.INTEGER
                },
                "labelId": {
                    "primaryKey": true,
                    "field": "label_id",
                    "type": Sequelize.INTEGER
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "core_bank_transaction",
            {
                "id": {
                    "autoIncrement": true,
                    "primaryKey": true,
                    "field": "id",
                    "type": Sequelize.INTEGER
                },
                "groupOwnerId": {
                    "allowNull": false,
                    "field": "group_owner_id",
                    "type": Sequelize.INTEGER
                },
                "movementName": {
                    "allowNull": false,
                    "field": "movement_name",
                    "type": Sequelize.STRING(255)
                },
                "date": {
                    "allowNull": false,
                    "field": "date",
                    "type": Sequelize.DATEONLY
                },
                "dateValue": {
                    "allowNull": true,
                    "field": "date_value",
                    "type": Sequelize.DATEONLY
                },
                "details": {
                    "allowNull": true,
                    "field": "details",
                    "type": Sequelize.STRING
                },
                "value": {
                    "allowNull": false,
                    "field": "value",
                    "type": Sequelize.DOUBLE
                },
                "kind": {
                    "allowNull": false,
                    "field": "kind",
                    "type": Sequelize.STRING(255)
                },
                "description": {
                    "allowNull": true,
                    "field": "description",
                    "type": Sequelize.STRING
                },
                "pageKey": {
                    "allowNull": false,
                    "field": "page_key",
                    "type": Sequelize.STRING(255)
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "session_user",
            {
                "id": {
                    "autoIncrement": true,
                    "primaryKey": true,
                    "field": "id",
                    "type": Sequelize.INTEGER
                },
                "defaultGroupId": {
                    "field": "default_group_id",
                    "type": Sequelize.INTEGER
                },
                "password": {
                    "allowNull": false,
                    "field": "password",
                    "type": Sequelize.STRING(128)
                },
                "lastLogin": {
                    "allowNull": true,
                    "field": "last_login",
                    "type": Sequelize.DATE
                },
                "isSuperuser": {
                    "allowNull": false,
                    "field": "is_superuser",
                    "type": Sequelize.BOOLEAN
                },
                "username": {
                    "allowNull": false,
                    "field": "username",
                    "type": Sequelize.STRING(150)
                },
                "firstName": {
                    "allowNull": false,
                    "field": "first_name",
                    "type": Sequelize.STRING(150)
                },
                "lastName": {
                    "allowNull": false,
                    "field": "last_name",
                    "type": Sequelize.STRING(150)
                },
                "email": {
                    "allowNull": false,
                    "field": "email",
                    "type": Sequelize.STRING(254)
                },
                "isStaff": {
                    "allowNull": false,
                    "field": "is_staff",
                    "type": Sequelize.BOOLEAN
                },
                "isActive": {
                    "allowNull": false,
                    "field": "is_active",
                    "type": Sequelize.BOOLEAN
                },
                "dateJoined": {
                    "allowNull": false,
                    "field": "date_joined",
                    "type": Sequelize.DATE
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "user_group",
            {
                "id": {
                    "autoIncrement": true,
                    "primaryKey": true,
                    "field": "id",
                    "type": Sequelize.INTEGER
                },
                "name": {
                    "allowNull": false,
                    "field": "name",
                    "type": Sequelize.STRING(150)
                },
                "ownerId": {
                    "allowNull": false,
                    "field": "ownerId",
                    "type": Sequelize.INTEGER
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "user_group_rel",
            {
                "id": {
                    "autoIncrement": true,
                    "allowNull": false,
                    "primaryKey": true,
                    "field": "id",
                    "type": Sequelize.INTEGER
                },
                "userGroupId": {
                    "allowNull": false,
                    "field": "user_group_id",
                    "type": Sequelize.INTEGER
                },
                "userId": {
                    "allowNull": false,
                    "field": "user_id",
                    "type": Sequelize.INTEGER
                }
            },
            {}
        ]
    },
    {
        fn: "createTable",
        params: [
            "SequelizeMeta",
            {
                "name": {
                    "allowNull": false,
                    "primaryKey": true,
                    "field": "name",
                    "type": Sequelize.STRING
                }
            },
            {
                "charset": null
            }
        ]
    },
    {
        fn: "createTable",
        params: [
            "session_session",
            {
                "sessionId": {
                    "primaryKey": true,
                    "field": "sessionId",
                    "type": Sequelize.STRING
                },
                "userId": {
                    "references": {
                        "model": "session_user",
                        "key": "id"
                    },
                    "allowNull": true,
                    "field": "userId",
                    "type": Sequelize.INTEGER
                },
                "createdAt": {
                    "allowNull": false,
                    "field": "createdAt",
                    "type": Sequelize.DATE
                },
                "lastActivity": {
                    "allowNull": false,
                    "field": "lastActivity",
                    "type": Sequelize.DATE
                },
                "updatedAt": {
                    "allowNull": false,
                    "field": "updatedAt",
                    "type": Sequelize.DATE
                }
            },
            {}
        ]
    },
    {
        fn: "addIndex",
        params: [
            "core_bank_transaction",
            ["group_owner_id", "date", "id"],
            {
                "indexName": "cursor",
                "name": "cursor"
            }
        ]
    },
    {
        fn: "addIndex",
        params: [
            "session_session",
            [{
                "name": "createdAt"
            }],
            {
                "indexName": "session_session_created_at",
                "name": "session_session_created_at"
            }
        ]
    },
    {
        fn: "addIndex",
        params: [
            "session_session",
            [{
                "name": "lastActivity"
            }],
            {
                "indexName": "session_session_last_activity",
                "name": "session_session_last_activity"
            }
        ]
    },
    {
        fn: "addIndex",
        params: [
            "user_group_rel",
            ["user_id", "user_group_id"],
            {
                "indexName": "user_group_rel_user_id_user_group_id",
                "name": "user_group_rel_user_id_user_group_id",
                "indicesType": "UNIQUE",
                "type": "UNIQUE"
            }
        ]
    }
];

module.exports = {
    pos: 0,
    up: function({context: queryInterface}, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
          async function next() {
            if (index < migrationCommands.length) {
                let command = migrationCommands[index];
                console.log("[#" + index + "] execute: " + command.fn);
                index++;
                queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
            }
            else
                resolve();
        }
            next();
        });
    },
    info: info
};
