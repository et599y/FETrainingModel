USE [FEModel]
GO
/****** Object:  User [2007038]    Script Date: 2020/8/20 上午 11:19:29 ******/
CREATE USER [2007038] FOR LOGIN [2007038] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [2007038]
GO
ALTER ROLE [db_accessadmin] ADD MEMBER [2007038]
GO
ALTER ROLE [db_securityadmin] ADD MEMBER [2007038]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [2007038]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [2007038]
GO
ALTER ROLE [db_datareader] ADD MEMBER [2007038]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [2007038]
GO
ALTER ROLE [db_denydatareader] ADD MEMBER [2007038]
GO
ALTER ROLE [db_denydatawriter] ADD MEMBER [2007038]
GO
/****** Object:  Table [dbo].[Model]    Script Date: 2020/8/20 上午 11:19:29 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Model](
	[ProjectId] [varchar](15) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[MAE] [float] NULL,
	[MSE] [float] NULL,
	[RMSE] [float] NULL,
	[MAPE] [float] NULL,
	[R2] [float] NULL,
	[CreateTime] [datetime] NULL,
	[y] [nvarchar](100) NULL,
 CONSTRAINT [PK_Model] PRIMARY KEY CLUSTERED 
(
	[ProjectId] ASC,
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Projects]    Script Date: 2020/8/20 上午 11:19:29 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Projects](
	[UserId] [uniqueidentifier] NOT NULL,
	[ProjectId] [varchar](15) NOT NULL,
	[Name] [nvarchar](40) NULL,
	[Goal] [nvarchar](100) NULL,
	[Description] [nvarchar](200) NULL,
	[Purpose] [nvarchar](15) NULL,
	[CreateTime] [datetime] NULL,
	[ModifyTime] [datetime] NULL,
	[Process] [int] NULL,
	[TrainVal] [float] NULL,
	[ValidVal] [float] NULL,
	[TestVal] [float] NULL,
	[Model] [nvarchar](50) NULL,
 CONSTRAINT [PK_Projects] PRIMARY KEY CLUSTERED 
(
	[ProjectId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 2020/8/20 上午 11:19:29 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserId] [uniqueidentifier] NOT NULL,
	[UserName] [varchar](50) NULL,
	[Password] [varchar](50) NULL,
	[Class] [nvarchar](50) NULL,
	[Site] [varchar](10) NULL,
	[Sort] [int] NULL,
 CONSTRAINT [PK_Users_1] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'f64f1c1f-b951-4b4d-92ce-087f59333509', N'MEFAD3', N'MEFAD3', N'空調課', N'TC3', 5)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'7b7274f9-62d9-4f98-8622-0bba1cb07c40', N'MEFAG1', N'MEFAG1', N'電控課', N'LK', 7)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'9b56392a-ba1f-49f0-ab3a-15a5e8f304a2', N'MEFAB3', N'MEFAB3', N'水處理課', N'TC1', 3)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'2b967524-64e1-4ed3-a2c3-219fa94099d2', N'MEFA00', N'MEFA00', N'整合課', N'MEFA00', 1)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'ae1108dc-742a-4dfb-abf6-2d235566ad86', N'MEFAG3', N'MEFAG3', N'水處理課', N'LK', 7)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'13bb782e-16b5-4bbd-af34-2d982db69623', N'MEFAG4', N'MEFAG4', N'氣化課', N'LK', 7)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'555745ce-9a35-459e-b582-38637cefd3bc', N'MEFAD4', N'MEFAD4', N'水處理課', N'TC2', 4)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'2dc0fdf5-7558-4f73-9a92-39b2af49c0c6', N'MEFAB4', N'MEFAB4', N'氣化課', N'TC1', 3)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'cd540a97-6a0b-4af0-863d-4b1cc6ed2136', N'MEFAD2', N'MEFAD2', N'空調課', N'TC2', 4)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'7cc7834e-e638-49dc-bae4-4eb5d6b4402b', N'MEFAB2', N'MEFAB2', N'空調課', N'TC1', 3)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'79eea779-7a18-483d-baf7-5652c7408d39', N'MEFAE2', N'MEFAE2', N'技術發展課', N'MEFAE0', 2)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'68bae540-1be2-4c78-8172-6595a31477f5', N'MEFAF4', N'MEFAF4', N'氣化課', N'HL', 6)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'7ee7b981-0134-448b-afed-6c3fa4a298db', N'MEFAD6', N'MEFAD6', N'氣化課', N'TC2', 4)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'03a163d9-ff0c-4db6-acc4-8b779f1dc2c2', N'MEFAG2', N'MEFAG2', N'空調課', N'LK', 7)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'aa653120-96e3-4c38-b9b9-a0744af88ba8', N'MEFAF3', N'MEFAF3', N'水處理課', N'HL', 6)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'89067f72-c030-4c24-87e7-b1ff72985f08', N'MEFAD5', N'MEFAD5', N'水處理課', N'TC3', 5)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'4bb362db-245b-48b7-ae11-b5ab7d73ab56', N'MEFAE1', N'MEFAE1', N'系統開發課', N'MEFAE0', 2)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'41b01404-3523-40a7-87ac-b792d9398c52', N'MEFAF1', N'MEFAF1', N'電控課', N'HL', 6)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'eb4d0872-74ed-45ec-8249-c911a78de00f', N'MEFAF2', N'MEFAF2', N'空調課', N'HL', 6)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'c4948b6f-b571-4ef2-87bd-cb54bc0ed95d', N'MEFAD1', N'MEFAD1', N'電控課', N'TC2', 4)
INSERT [dbo].[Users] ([UserId], [UserName], [Password], [Class], [Site], [Sort]) VALUES (N'9092d3f7-b6cd-4a4f-bae4-d303cc88aaa2', N'MEFAB1', N'MEFAB1', N'電控課', N'TC1', 3)
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_Users_GUID]  DEFAULT (newid()) FOR [UserId]
GO
