/*
ROLE
*/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Roles](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [nvarchar](max) NULL
)
GO
ALTER TABLE [dbo].[Roles] ADD  CONSTRAINT [PK_dbo.Roles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

/*
ROLES VALUES
*/
INSERT INTO Roles (RoleName)
VALUES ('Administrator');
GO

INSERT INTO Roles (RoleName)
VALUES ('User');
GO

/*
USER
*/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserName] [nvarchar](max) NOT NULL,
	[Email] [nvarchar](max) NOT NULL,
	[PasswordSalt] [nvarchar](max) NOT NULL,
	[Password] [nvarchar](max) NOT NULL,
	[FailedLoginAttemptsCount] [int] NOT NULL,
	[Role_Id] [int] NOT NULL,
	[RefreshToken] [nvarchar](max) NULL
)
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [PK_dbo.Users] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_Role_Id] ON [dbo].[Users]
(
	[Role_Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CONSTRAINT [FK_dbo.Users.Role_Id] FOREIGN KEY([Role_Id])
REFERENCES [dbo].[Roles] ([Id])
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_dbo.Users.Role_Id]
GO

/*
USER DATA
*/
INSERT INTO [dbo].[Users] ([UserName], [Email], [PasswordSalt], [Password], [FailedLoginAttemptsCount], [Role_Id])
VALUES ('Admin', 'alckevich@live.con', '', '123456', 0, 1);
GO

/*
MODULE
*/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Modules](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
    [Description] [nvarchar](max) NOT NULL,
	[CreatedBy] [int] NOT NULL,
	[Locked] [bit] DEFAULT 1,
	[Order] [int] NOT NULL,
)
GO
ALTER TABLE [dbo].[Modules] ADD  CONSTRAINT [PK_dbo.Modules] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Modules] WITH CHECK ADD CONSTRAINT [FK_dbo.Modules.CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Modules] CHECK CONSTRAINT [FK_dbo.Modules.CreatedBy]
GO

/*
TASK
*/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Tasks](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
    [Threshold] [int] NOT NULL,
    [Order] [int] NOT NULL,
    [Cost] [int] NOT NULL,
	[VertexShader] [text] NULL,
	[FragmentShader] [text] NULL,
	[Visibility] [bit] DEFAULT 0,
	[CreatedBy] [int] NOT NULL,
	[Module_Id] [int] NOT NULL
)
GO
ALTER TABLE [dbo].[Tasks] ADD  CONSTRAINT [PK_dbo.Tasks] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

ALTER TABLE [dbo].[Tasks] WITH CHECK ADD CONSTRAINT [FK_dbo.Tasks.Module_Id] FOREIGN KEY([Module_Id])
REFERENCES [dbo].[Modules] ([Id])
GO
ALTER TABLE [dbo].[Tasks] CHECK CONSTRAINT [FK_dbo.Tasks.Module_Id]
GO

ALTER TABLE [dbo].[Tasks] WITH CHECK ADD CONSTRAINT [FK_dbo.Tasks.CreatedBy] FOREIGN KEY([CreatedBy])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Tasks] CHECK CONSTRAINT [FK_dbo.Tasks.CreatedBy]
GO

/*
TASK DATA
INSERT INTO [dbo].[Tasks] ([Name], [Threshold], [Order], [Cost])
VALUES ('${task.Name}', '${task.Threshold}', '${task.Order}', '${task.Cost}')

INSERT INTO [dbo].[Tasks] ([Name], [Threshold], [Order], [Cost])
VALUES ('Step', 90, 1, 10);
GO

INSERT INTO [dbo].[Tasks] ([Name], [Threshold], [Order], [Cost])
VALUES ('Linear Gradient', 90, 2, 10);
GO
*/


/*
TASK HINT
*/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaskHints](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Message] [nvarchar](max) NOT NULL,
    [Order] [int] NOT NULL,
    [Task_Id] [int] NOT NULL
)
GO
ALTER TABLE [dbo].[TaskHints] ADD  CONSTRAINT [PK_dbo.TaskHints] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_Task_Id] ON [dbo].[TaskHints]
(
	[Task_Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[TaskHints] WITH CHECK ADD CONSTRAINT [FK_dbo.TaskHints.Task_Id] FOREIGN KEY([Task_Id])
REFERENCES [dbo].[Tasks] ([Id])
GO
ALTER TABLE [dbo].[TaskHints] CHECK CONSTRAINT [FK_dbo.TaskHints.Task_Id]
GO

/*
TASK CODE RESTRICTION
*/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TaskCodeRestrictions](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Message] [nvarchar](max) NOT NULL,
    [Expression] [nvarchar](max) NOT NULL,
    [Cost] [int] NOT NULL,
    [Task_Id] [int] NOT NULL
)
GO
ALTER TABLE [dbo].[TaskCodeRestrictions] ADD  CONSTRAINT [PK_dbo.TaskCodeRestrictions] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_Task_Id] ON [dbo].[TaskCodeRestrictions]
(
	[Task_Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[TaskCodeRestrictions] WITH CHECK ADD CONSTRAINT [FK_dbo.TaskCodeRestrictions.Task_Id] FOREIGN KEY([Task_Id])
REFERENCES [dbo].[Tasks] ([Id])
GO
ALTER TABLE [dbo].[TaskCodeRestrictions] CHECK CONSTRAINT [FK_dbo.TaskCodeRestrictions.Task_Id]
GO

/*
USER TASK
*/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserTask](
    [User_Id] [int] NOT NULL,
    [Task_Id] [int] NOT NULL,
    [Score] [int] NOT NULL,
    [Accepted] [bit] DEFAULT 0,
    [Rejected] [bit] DEFAULT 0,
	[Liked] [bit] DEFAULT NULL,
	[VertexShader] [text] NULL,
	[FragmentShader] [text] NULL
)
GO
ALTER TABLE [dbo].[UserTask] ADD CONSTRAINT [PK_dbo.UserTask] PRIMARY KEY CLUSTERED 
(
	[User_Id] ASC,
    [Task_Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO

CREATE NONCLUSTERED INDEX [IX_User_Id] ON [dbo].[UserTask]
(
	[User_Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[UserTask] WITH CHECK ADD CONSTRAINT [FK_dbo.UserTask.User_Id] FOREIGN KEY([User_Id])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[UserTask] CHECK CONSTRAINT [FK_dbo.UserTask.User_Id]
GO

CREATE NONCLUSTERED INDEX [IX_Task_Id] ON [dbo].[UserTask]
(
	[Task_Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[UserTask] WITH CHECK ADD CONSTRAINT [FK_dbo.UserTask.Task_Id] FOREIGN KEY([Task_Id])
REFERENCES [dbo].[Tasks] ([Id])
GO
ALTER TABLE [dbo].[UserTask] CHECK CONSTRAINT [FK_dbo.UserTask.Task_Id]
GO