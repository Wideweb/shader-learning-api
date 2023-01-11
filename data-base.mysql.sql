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
GO

INSERT INTO `Roles` (`RoleName`)
VALUES ('User');
GO

/*
USER
*/
CREATE TABLE `Users`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`UserName` nvarchar(255) NOT NULL,
	`Email` nvarchar(255) NOT NULL,
	`PasswordSalt` TEXT NOT NULL,
	`Password` TEXT NOT NULL,
	`FailedLoginAttemptsCount` INT NOT NULL,
	`Role_Id` INT NOT NULL,
	`RefreshToken` TEXT NULL,

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
MODULE
*/
CREATE TABLE `Modules`(
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` nvarchar(255) NOT NULL,
    `Description` TEXT NOT NULL,
	`CreatedBy` INT NOT NULL,
	`Locked` TINYINT DEFAULT 1,
	`Order` INT NOT NULL,

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

	PRIMARY KEY (`Id`),
	FOREIGN KEY (`Module_Id`) REFERENCES `Modules`(`Id`),
	FOREIGN KEY (`CreatedBy`) REFERENCES `Users`(`Id`)
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

	PRIMARY KEY (`User_Id`, `Task_Id`) ,
	FOREIGN KEY (`User_Id`) REFERENCES `Users`(`Id`),
	FOREIGN KEY (`Task_Id`) REFERENCES `Tasks`(`Id`)
)