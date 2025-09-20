import { relations } from "drizzle-orm/relations";
import { metric, metricvalue, entity, report, socialprofile, review, reportsection, insight, adcreative, reportmedia, client, vertical, user, sectionitem, reporttag, tag } from "./schema";

export const metricvalueRelations = relations(metricvalue, ({one}) => ({
	metric: one(metric, {
		fields: [metricvalue.metricid],
		references: [metric.metricid]
	}),
	entity: one(entity, {
		fields: [metricvalue.entityid],
		references: [entity.entityid]
	}),
	report: one(report, {
		fields: [metricvalue.reportid],
		references: [report.reportid]
	}),
}));

export const metricRelations = relations(metric, ({many}) => ({
	metricvalues: many(metricvalue),
}));

export const entityRelations = relations(entity, ({many}) => ({
	metricvalues: many(metricvalue),
	socialprofiles: many(socialprofile),
	reviews: many(review),
	adcreatives: many(adcreative),
}));

export const reportRelations = relations(report, ({one, many}) => ({
	metricvalues: many(metricvalue),
	reviews: many(review),
	adcreatives: many(adcreative),
	reportmedias: many(reportmedia),
	client: one(client, {
		fields: [report.clientid],
		references: [client.clientid]
	}),
	vertical: one(vertical, {
		fields: [report.verticalid],
		references: [vertical.verticalid]
	}),
	user: one(user, {
		fields: [report.createdbyuserid],
		references: [user.userid]
	}),
	reportsections: many(reportsection),
	reporttags: many(reporttag),
}));

export const socialprofileRelations = relations(socialprofile, ({one}) => ({
	entity: one(entity, {
		fields: [socialprofile.entityid],
		references: [entity.entityid]
	}),
}));

export const reviewRelations = relations(review, ({one}) => ({
	entity: one(entity, {
		fields: [review.entityid],
		references: [entity.entityid]
	}),
	report: one(report, {
		fields: [review.reportid],
		references: [report.reportid]
	}),
}));

export const insightRelations = relations(insight, ({one}) => ({
	reportsection: one(reportsection, {
		fields: [insight.reportsectionid],
		references: [reportsection.sectionid]
	}),
}));

export const reportsectionRelations = relations(reportsection, ({one, many}) => ({
	insights: many(insight),
	reportmedias: many(reportmedia),
	report: one(report, {
		fields: [reportsection.reportid],
		references: [report.reportid]
	}),
	sectionitems: many(sectionitem),
}));

export const adcreativeRelations = relations(adcreative, ({one}) => ({
	entity: one(entity, {
		fields: [adcreative.entityid],
		references: [entity.entityid]
	}),
	report: one(report, {
		fields: [adcreative.reportid],
		references: [report.reportid]
	}),
}));

export const reportmediaRelations = relations(reportmedia, ({one}) => ({
	report: one(report, {
		fields: [reportmedia.reportid],
		references: [report.reportid]
	}),
	reportsection: one(reportsection, {
		fields: [reportmedia.sectionid],
		references: [reportsection.sectionid]
	}),
}));

export const clientRelations = relations(client, ({many}) => ({
	reports: many(report),
}));

export const verticalRelations = relations(vertical, ({many}) => ({
	reports: many(report),
}));

export const userRelations = relations(user, ({many}) => ({
	reports: many(report),
}));

export const sectionitemRelations = relations(sectionitem, ({one}) => ({
	reportsection: one(reportsection, {
		fields: [sectionitem.sectionid],
		references: [reportsection.sectionid]
	}),
}));

export const reporttagRelations = relations(reporttag, ({one}) => ({
	report: one(report, {
		fields: [reporttag.reportid],
		references: [report.reportid]
	}),
	tag: one(tag, {
		fields: [reporttag.tagid],
		references: [tag.tagid]
	}),
}));

export const tagRelations = relations(tag, ({many}) => ({
	reporttags: many(reporttag),
}));