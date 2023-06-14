/*
ROLE
*/
CREATE TABLE `Roles`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`RoleName` nvarchar(255) NOT NULL,
    
	PRIMARY KEY (`Id`)
)

/*
ROLES VALUES
*/
INSERT INTO `Roles` (`RoleName`)
VALUES ('Administrator');

INSERT INTO `Roles` (`RoleName`)
VALUES ('User');


/*
USER
*/
CREATE TABLE `Users`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`UserName` nvarchar(255) NOT NULL,
	`Email` nvarchar(255) NOT NULL,
	`PasswordSalt` TEXT NOT NULL,
	`Password` TEXT NOT NULL,
	`ResetPasswordToken` TEXT NOT NULL,
	`FailedLoginAttemptsCount` INT NOT NULL,
	`Role_Id` INT NOT NULL,

	PRIMARY KEY (`Id`),
	FOREIGN KEY (`Role_Id`) REFERENCES `Roles`(`Id`)
)

/*
USER DATA
*/
INSERT INTO [dbo].[Users] ([UserName], [Email], [PasswordSalt], [Password], [FailedLoginAttemptsCount], [Role_Id])
VALUES ('Admin', 'alckevich@live.con', '', '123456', 0, 1);
GO

/*
USER SESSIONS
*/
CREATE TABLE `UserSessions`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`User_Id` INT NOT NULL,
	`RefreshToken` TEXT NULL,
	`StartedAt` DATETIME,
	`FinishedAt` DATETIME,

	PRIMARY KEY (`Id`),
	FOREIGN KEY (`User_Id`) REFERENCES `Users`(`Id`)
)

/*
MODULE
*/
CREATE TABLE `Modules`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` nvarchar(255) NOT NULL,
    `Description` TEXT NOT NULL,
	`CreatedBy` INT NOT NULL,
	`Locked` TINYINT DEFAULT 1,
	`Order` INT NOT NULL,
	`Cover` TINYINT DEFAULT 1,

	PRIMARY KEY (`Id`),
	FOREIGN KEY (`CreatedBy`) REFERENCES `Users`(`Id`)
)

/*
TASK
*/
CREATE TABLE `Tasks`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` nvarchar(255) NOT NULL,
    `Threshold` INT NOT NULL,
    `Order` INT NOT NULL,
    `Cost` INT NOT NULL,
	`Visibility` TINYINT DEFAULT 1,
	`CreatedBy` INT NOT NULL,
	`Module_Id` INT NOT NULL,
	`Animated` TINYINT DEFAULT 0,
	`AnimationSteps` INT DEFAULT NULL,
	`AnimationStepTime` INT DEFAULT NULL,
	`Data` JSON,
	`VertexCodeEditable` TINYINT DEFAULT 0,
	`FragmentCodeEditable` TINYINT DEFAULT 1,

	PRIMARY KEY (`Id`),
	FOREIGN KEY (`Module_Id`) REFERENCES `Modules`(`Id`),
	FOREIGN KEY (`CreatedBy`) REFERENCES `Users`(`Id`)
)

/*
TASK FEEDBACK
*/
CREATE TABLE `TaskFeedback`(
    `User_Id` INT NOT NULL,
    `Task_Id` INT NOT NULL,
    `UnclearDescription` TINYINT DEFAULT 0,
    `StrictRuntime` TINYINT DEFAULT 0,
	`Other` TINYINT DEFAULT 0,
	`Message` TEXT DEFAULT NULL,

	FOREIGN KEY (`User_Id`) REFERENCES `Users`(`Id`),
	FOREIGN KEY (`Task_Id`) REFERENCES `Tasks`(`Id`)
)


/*
TASK CHANNEL
*/
CREATE TABLE `TaskChannels`(
	`Task_Id` INT NOT NULL,
	`Index` INT NOT NULL,

	PRIMARY KEY (`Task_Id`, `Index`),
	FOREIGN KEY (`Task_Id`) REFERENCES `Tasks`(`Id`)
)

/*
USER TASK
*/
CREATE TABLE `UserTask`(
    `User_Id` INT NOT NULL,
    `Task_Id` INT NOT NULL,
    `Score` INT NOT NULL,
    `Accepted` TINYINT DEFAULT 0,
    `Rejected` TINYINT DEFAULT 0,
	`Liked` TINYINT DEFAULT NULL,
	`Data` JSON
	`AcceptedAt` DATETIME,

	PRIMARY KEY (`User_Id`, `Task_Id`) ,
	FOREIGN KEY (`User_Id`) REFERENCES `Users`(`Id`),
	FOREIGN KEY (`Task_Id`) REFERENCES `Tasks`(`Id`)
)

CREATE TABLE `UserTaskSubmissions`(
    `User_Id` INT NOT NULL,
    `Task_Id` INT NOT NULL,
    `Score` INT NOT NULL,
    `Accepted` TINYINT NOT NULL,
	`Data` JSON,
	`At` DATETIME,

	FOREIGN KEY (`User_Id`) REFERENCES `Users`(`Id`),
	FOREIGN KEY (`Task_Id`) REFERENCES `Tasks`(`Id`)
)

/*
PERMISSIONS
*/
CREATE TABLE `Permissions`(
	`Id` INT NOT NULL,
	`Name` nvarchar(255) NOT NULL,
    
	PRIMARY KEY (`Id`)
);

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (1, 'profile_view');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (2, 'users_rating');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (3, 'task_view');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (4, 'task_submit');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (5, 'task_create');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (6, 'task_edit');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (7, 'task_edit_all');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (8, 'task_edit_visibility');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (9, 'task_delete');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (10, 'task_reorder');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (11, 'module_create');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (12, 'module_view');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (13, 'module_edit');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (14, 'module_edit_all');

INSERT INTO `Permissions` (`Id`, `Name`)
VALUES (15, 'profile_view_all');

/*
ROLE PERMISSIONS
*/
CREATE TABLE `RolePermissions`(
	`Role_Id` INT NOT NULL,
	`Permission_Id` INT NOT NULL,
	
    
	PRIMARY KEY (`Role_Id`, `Permission_Id`) ,
	FOREIGN KEY (`Role_Id`) REFERENCES `Roles`(`Id`,
	FOREIGN KEY (`Permission_Id`) REFERENCES `Permissions`(`Id`)
);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 1);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 2);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 3);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 4);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 5);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 6);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 7);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 8);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 9);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 10);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 11);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 12);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 13);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 14);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (1, 15);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (2, 1);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (2, 2);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (2, 3);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (2, 4);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (2, 12);

INSERT INTO `RolePermissions` (`Role_Id`, `Permission_Id`)
VALUES (2, 15);

/*
USER PERMISSIONS
*/
CREATE TABLE `UserPermissions`(
	`User_Id` INT NOT NULL,
	`Permission_Id` INT NOT NULL,
    
	PRIMARY KEY (`User_Id`, `Permission_Id`) ,
	FOREIGN KEY (`User_Id`) REFERENCES `Users`(`Id`),
	FOREIGN KEY (`Permission_Id`) REFERENCES `Permissions`(`Id`)
);

/*
FEEDBACK
*/
CREATE TABLE `Feedback`(
    `Id` INT NOT NULL AUTO_INCREMENT,
	`AuthorName` nvarchar(255) NOT NULL,
	`AuthorTitle` nvarchar(255) NOT NULL,
	`Message` TEXT DEFAULT NULL,
	`Order` INT NOT NULL,

	PRIMARY KEY (`Id`)
);