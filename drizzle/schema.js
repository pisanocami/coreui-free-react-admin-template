import { pgTable, serial, varchar, text, timestamp, index, foreignKey, integer, numeric, boolean, date, unique, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const entity = pgTable("entity", {
	entityid: serial().primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	type: varchar({ length: 32 }),
	domain: varchar({ length: 128 }),
	description: text(),
});

export const competitor = pgTable("competitor", {
	competitorid: serial().primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	domain: varchar({ length: 128 }),
	industry: varchar({ length: 64 }),
	description: text(),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
});

export const metricvalue = pgTable("metricvalue", {
	valueid: serial().primaryKey().notNull(),
	metricid: integer(),
	entityid: integer(),
	reportid: integer(),
	periodtype: varchar({ length: 32 }),
	periodvalue: varchar({ length: 32 }),
	value: numeric(),
	additionalinfo: text(),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_metric_value_entity").using("btree", table.entityid.asc().nullsLast().op("int4_ops")),
	index("idx_metric_value_report").using("btree", table.reportid.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.metricid],
			foreignColumns: [metric.metricid],
			name: "metricvalue_metricid_fkey"
		}),
	foreignKey({
			columns: [table.entityid],
			foreignColumns: [entity.entityid],
			name: "metricvalue_entityid_fkey"
		}),
	foreignKey({
			columns: [table.reportid],
			foreignColumns: [report.reportid],
			name: "metricvalue_reportid_fkey"
		}).onDelete("cascade"),
]);

export const socialprofile = pgTable("socialprofile", {
	profileid: serial().primaryKey().notNull(),
	entityid: integer(),
	platform: varchar({ length: 64 }),
	url: text(),
	followers: integer(),
	lastupdated: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.entityid],
			foreignColumns: [entity.entityid],
			name: "socialprofile_entityid_fkey"
		}),
]);

export const review = pgTable("review", {
	reviewid: serial().primaryKey().notNull(),
	entityid: integer(),
	reportid: integer(),
	ispositive: boolean(),
	reviewsource: varchar({ length: 128 }),
	content: text(),
	mentionedproduct: varchar({ length: 64 }),
	rating: integer(),
	reviewdate: date(),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.entityid],
			foreignColumns: [entity.entityid],
			name: "review_entityid_fkey"
		}),
	foreignKey({
			columns: [table.reportid],
			foreignColumns: [report.reportid],
			name: "review_reportid_fkey"
		}),
]);

export const insight = pgTable("insight", {
	insightid: serial().primaryKey().notNull(),
	reportsectionid: integer(),
	title: varchar({ length: 128 }),
	type: varchar({ length: 64 }),
	content: text(),
	position: integer(),
	priority: varchar({ length: 32 }),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.reportsectionid],
			foreignColumns: [reportsection.sectionid],
			name: "insight_reportsectionid_fkey"
		}),
]);

export const adcreative = pgTable("adcreative", {
	adid: serial().primaryKey().notNull(),
	entityid: integer(),
	reportid: integer(),
	format: varchar({ length: 64 }),
	campaign: varchar({ length: 128 }),
	creativeurl: text(),
	performancenotes: text(),
	adplatform: varchar({ length: 64 }),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.entityid],
			foreignColumns: [entity.entityid],
			name: "adcreative_entityid_fkey"
		}),
	foreignKey({
			columns: [table.reportid],
			foreignColumns: [report.reportid],
			name: "adcreative_reportid_fkey"
		}),
]);

export const reportmedia = pgTable("reportmedia", {
	mediaid: serial().primaryKey().notNull(),
	reportid: integer(),
	sectionid: integer(),
	type: varchar({ length: 64 }),
	url: text(),
	caption: text(),
	filesize: integer(),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.reportid],
			foreignColumns: [report.reportid],
			name: "reportmedia_reportid_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sectionid],
			foreignColumns: [reportsection.sectionid],
			name: "reportmedia_sectionid_fkey"
		}),
]);

export const vertical = pgTable("vertical", {
	verticalid: serial().primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	description: text(),
});

export const user = pgTable("User", {
	userid: serial().primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	email: varchar({ length: 128 }).notNull(),
	role: varchar({ length: 32 }).notNull(),
	status: varchar({ length: 32 }),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	unique("User_email_key").on(table.email),
]);

export const client = pgTable("client", {
	clientid: serial().primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	industry: varchar({ length: 128 }),
	maincontact: varchar({ length: 128 }),
	status: varchar({ length: 32 }),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
});

export const report = pgTable("report", {
	reportid: serial().primaryKey().notNull(),
	name: varchar({ length: 256 }).notNull(),
	summary: text(),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
	updatedat: timestamp({ mode: 'string' }).defaultNow(),
	clientid: integer(),
	verticalid: integer(),
	createdbyuserid: integer(),
	filelink: text(),
	status: varchar({ length: 32 }),
}, (table) => [
	index("idx_report_client").using("btree", table.clientid.asc().nullsLast().op("int4_ops")),
	index("idx_report_created_at").using("btree", table.createdat.asc().nullsLast().op("timestamp_ops")),
	index("idx_report_vertical").using("btree", table.verticalid.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.clientid],
			foreignColumns: [client.clientid],
			name: "report_clientid_fkey"
		}),
	foreignKey({
			columns: [table.verticalid],
			foreignColumns: [vertical.verticalid],
			name: "report_verticalid_fkey"
		}),
	foreignKey({
			columns: [table.createdbyuserid],
			foreignColumns: [user.userid],
			name: "report_createdbyuserid_fkey"
		}),
]);

export const reportsection = pgTable("reportsection", {
	sectionid: serial().primaryKey().notNull(),
	reportid: integer(),
	sectionname: varchar({ length: 128 }).notNull(),
	position: integer(),
	description: text(),
}, (table) => [
	index("idx_section_report").using("btree", table.reportid.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.reportid],
			foreignColumns: [report.reportid],
			name: "reportsection_reportid_fkey"
		}).onDelete("cascade"),
]);

export const sectionitem = pgTable("sectionitem", {
	itemid: serial().primaryKey().notNull(),
	sectionid: integer(),
	itemtitle: varchar({ length: 128 }).notNull(),
	content: text(),
	position: integer(),
	type: varchar({ length: 64 }),
	createdat: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_item_section").using("btree", table.sectionid.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.sectionid],
			foreignColumns: [reportsection.sectionid],
			name: "sectionitem_sectionid_fkey"
		}).onDelete("cascade"),
]);

export const tag = pgTable("tag", {
	tagid: serial().primaryKey().notNull(),
	name: varchar({ length: 64 }).notNull(),
	category: varchar({ length: 32 }),
	description: text(),
}, (table) => [
	index("idx_tag_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	unique("tag_name_key").on(table.name),
]);

export const metric = pgTable("metric", {
	metricid: serial().primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	unit: varchar({ length: 32 }),
	description: text(),
	category: varchar({ length: 64 }),
});

export const reporttag = pgTable("reporttag", {
	reportid: integer().notNull(),
	tagid: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.reportid],
			foreignColumns: [report.reportid],
			name: "reporttag_reportid_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagid],
			foreignColumns: [tag.tagid],
			name: "reporttag_tagid_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.reportid, table.tagid], name: "reporttag_pkey"}),
]);
