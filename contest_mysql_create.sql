CREATE TABLE `Participant` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` VARCHAR(50) NOT NULL,
	`Country` INT NOT NULL,
	`School` INT NOT NULL,
	`Participation` INT NOT NULL,
	`Award` INT NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `Task` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` VARCHAR(50) NOT NULL,
	`Value` varchar(5) NOT NULL,
	`Solved` BOOLEAN NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `Placement` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Participant` INT NOT NULL,
	`Contest` INT NOT NULL,
	`Award` INT NOT NULL,
	`Time` INT NOT NULL,
	`Total` INT NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `Country` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` varchar(50) NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `SchoolName` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` varchar(50) NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `Contest` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` VARCHAR(50) NOT NULL,
	`Year` INT NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `ContestTasks` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`ContestId` INT NOT NULL,
	`TaskId` INT NOT NULL,
	`Number` varchar(3) NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `School` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`SchoolName` INT NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `Participation` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Contest` INT NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `Result` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Participant` INT NOT NULL,
	`Task` INT NOT NULL,
	`Grade` INT NOT NULL,
	`Try` INT NOT NULL,
	`Time` INT NOT NULL,
	PRIMARY KEY (`Id`)
);

CREATE TABLE `Award` (
	`Id` INT NOT NULL AUTO_INCREMENT,
	`Name` varchar(50) NOT NULL,
	PRIMARY KEY (`Id`)
);

ALTER TABLE `Participant` ADD CONSTRAINT `Participant_fk0` FOREIGN KEY (`Country`) REFERENCES `Country`(`Id`);

ALTER TABLE `Participant` ADD CONSTRAINT `Participant_fk1` FOREIGN KEY (`School`) REFERENCES `School`(`Id`);

ALTER TABLE `Participant` ADD CONSTRAINT `Participant_fk2` FOREIGN KEY (`Participation`) REFERENCES `Participation`(`Id`);

ALTER TABLE `Participant` ADD CONSTRAINT `Participant_fk3` FOREIGN KEY (`Award`) REFERENCES `Award`(`Id`);

ALTER TABLE `Placement` ADD CONSTRAINT `Placement_fk0` FOREIGN KEY (`Participant`) REFERENCES `Participant`(`Id`);

ALTER TABLE `Placement` ADD CONSTRAINT `Placement_fk1` FOREIGN KEY (`Contest`) REFERENCES `Contest`(`Id`);

ALTER TABLE `Placement` ADD CONSTRAINT `Placement_fk2` FOREIGN KEY (`Award`) REFERENCES `Award`(`Id`);

ALTER TABLE `ContestTasks` ADD CONSTRAINT `ContestTasks_fk0` FOREIGN KEY (`ContestId`) REFERENCES `Contest`(`Id`);

ALTER TABLE `ContestTasks` ADD CONSTRAINT `ContestTasks_fk1` FOREIGN KEY (`TaskId`) REFERENCES `Task`(`Id`);

ALTER TABLE `School` ADD CONSTRAINT `School_fk0` FOREIGN KEY (`SchoolName`) REFERENCES `SchoolName`(`Id`);

ALTER TABLE `Participation` ADD CONSTRAINT `Participation_fk0` FOREIGN KEY (`Contest`) REFERENCES `Contest`(`Id`);

ALTER TABLE `Result` ADD CONSTRAINT `Result_fk0` FOREIGN KEY (`Participant`) REFERENCES `Participant`(`Id`);

ALTER TABLE `Result` ADD CONSTRAINT `Result_fk1` FOREIGN KEY (`Task`) REFERENCES `ContestTasks`(`Id`);