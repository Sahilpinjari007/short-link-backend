import { UAParser } from "ua-parser-js";
import { mongo, Types } from "mongoose";
import { CreateAnalyticsPayload } from "../../types/analytics.type";
import geoip from "geoip-lite";
import { Analytics } from "../../models/analytics.model";
import { Link } from "../../models/link.model";
import mongoose from "mongoose";
import { normalizeTrafficSource } from "../../utils/analytics.util";

export const createAnalytics = async (payload: CreateAnalyticsPayload) => {
  //system details
  const parser = new UAParser(payload.userAgent);
  const result = parser.getResult();

  //geo lookup
  const geo = geoip.lookup(payload.ipAddress!);

  await Analytics.create({
    userId: new Types.ObjectId(payload.userId!),
    resourceType: payload.resourceType,
    resourceId: new Types.ObjectId(payload.resourceId!),
    ipAddress: payload.ipAddress,
    country: geo?.country,
    city: geo?.city,
    region: geo?.region,
    browser: result.browser.name,
    os: result.os.name,
    device: result.device.type || "desktop",
    trafficSource: normalizeTrafficSource(payload.referrer),
  });
};

export const overviewService = async (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [linksResult, analyticsResult] = await Promise.all([
    /**
     * TOTAL LINKS
     */
    Link.aggregate([
      {
        $match: {
          userId: userObjectId,
        },
      },

      {
        $count: "totalLinks",
      },
    ]),

    /**
     * ANALYTICS STATS
     */
    Analytics.aggregate([
      {
        $match: {
          userId: userObjectId,
          resourceType: "link",
        },
      },

      {
        $facet: {
          /**
           * total clicks
           */
          totalClicks: [
            {
              $count: "count",
            },
          ],

          /**
           * today clicks
           */
          clicksToday: [
            {
              $match: {
                clickedAt: {
                  $gte: today,
                },
              },
            },

            {
              $count: "count",
            },
          ],

          /**
           * last 30 days
           */
          clicksLast30Days: [
            {
              $match: {
                clickedAt: {
                  $gte: last30Days,
                },
              },
            },

            {
              $count: "count",
            },
          ],
        },
      },
    ]),
  ]);

  return {
    linksOverview: {
      totalLinks: linksResult[0]?.totalLinks || 0,
      totalClicks: analyticsResult[0]?.totalClicks[0]?.count || 0,
      clicksToday: analyticsResult[0]?.clicksToday[0]?.count || 0,
      clicksLast30Days: analyticsResult[0]?.clicksLast30Days[0]?.count || 0,
    },
  };
};

export const accessOverTimeService = async (
  userId: string,
  range: string = "30d",
) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const startDate = new Date();

  switch (range) {
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;

    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;

    case "1y":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;

    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  const analytics = await Analytics.aggregate([
    {
      $match: {
        userId: userObjectId,
        resourceType: "link",
        clickedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$clickedAt",
          },
        },
        clicks: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        clicks: 1,
      },
    },
  ]);

  return analytics;
};

export const geographicAnalyticsService = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [countries, cities] = await Promise.all([
    Analytics.aggregate([
      {
        $match: {
          userId: userObjectId,
          country: {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$country",
          clicks: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          clicks: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          country: "$_id",
          clicks: 1,
        },
      },
    ]),

    Analytics.aggregate([
      {
        $match: {
          userId: userObjectId,
          city: {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$city",
          clicks: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          clicks: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          city: "$_id",
          clicks: 1,
        },
      },
    ]),
  ]);

  const countriesTotalClicks = countries.reduce(
    (acc, item) => acc + item.clicks,
    0,
  );
  const formatedCountries = countries.map((item) => ({
    ...item,
    percentage: Number((item.clicks / countriesTotalClicks) * 100).toFixed(1),
  }));

  const citiesTotalClicks = cities.reduce((acc, item) => acc + item.clicks, 0);
  const formatedCities = cities.map((item) => ({
    ...item,
    percentage: Number((item.clicks / citiesTotalClicks) * 100).toFixed(1),
  }));

  return {
    countries: formatedCountries,
    cities: formatedCities,
  };
};

export const deviceAnalyticsService = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [devices, operatingSystem] = await Promise.all([
    Analytics.aggregate([
      {
        $match: {
          userId: userObjectId,
          device: {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$device",
          clicks: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          clicks: -1,
        },
      },

      {
        $project: {
          _id: 0,
          device: "$_id",
          clicks: 1,
        },
      },
    ]),

    Analytics.aggregate([
      {
        $match: {
          userId: userObjectId,
          os: {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$os",
          clicks: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          clicks: -1,
        },
      },
      {
        $project: {
          _id: 0,
          os: "$_id",
          clicks: 1,
        },
      },
    ]),
  ]);

  const totalDeviceClicks = devices.reduce((acc, item) => acc + item.clicks, 0);
  const totalOSClicks = operatingSystem.reduce(
    (acc, item) => acc + item.clicks,
    0,
  );

  const formattedDevices = devices.map((item) => {
    return {
      ...item,
      percentage: Number((item.clicks / totalDeviceClicks) * 100).toFixed(1),
    };
  });

  const formattedOperatingSystems = operatingSystem.map((item) => {
    return {
      ...item,
      percentage: Number((item.clicks / totalOSClicks) * 100).toFixed(1),
    };
  });

  return {
    devices: formattedDevices,
    operatingSystems: formattedOperatingSystems,
  };
};

export const trafficeSourceService = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const sources = await Analytics.aggregate([
    {
      $match: {
        userId: userObjectId,
        trafficSource: {
          $ne: null,
        },
      },
    },
    {
      $group: {
        _id: "$trafficSource",
        clicks: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        clicks: -1,
      },
    },
    {
      $project: {
        _id: 0,
        trafficSource: "$_id",
        clicks: 1,
      },
    },
  ]);

  const totalClick = sources.reduce((acc, item) => acc + item.clicks, 0);

  const formattedSources = sources.map((item) => {
    return {
      ...item,
      percentage: Number((item.clicks / totalClick) * 100).toFixed(1),
    };
  });
  return formattedSources;
};

export const recentActivityService = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const activities = await Analytics.aggregate([
    {
      $match: {
        userId: userObjectId,
      },
    },
    {
      $sort: {
        clickedAt: -1,
      },
    },
    {
      $limit: 10,
    },
    {
      $lookup: {
        from: "links",
        localField: "resourceId",
        foreignField: "_id",
        as: "resource",
      },
    },
    {
      $unwind: {
        path: "$resource",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        resourceType: 1,
        source: "$trafficSource",
        location: {
          $concat: ["$city", ", ", "$country"],
        },
        device: 1,
        os: 1,
        clickedAt: 1,
        resource: {
          title: "$resource.title",
          shortUrl: "$resource.shortUrl",
          originalUrl: "$resource.originalUrl",
        },
      },
    },
  ]);
  return activities;
};

export const topPerformingResourcesService = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const topLinks = await Analytics.aggregate([
    {
      $match: {
        userId: userObjectId,
        resourceType: "link",
      },
    },
    {
      $group: {
        _id: "$resourceId",
        clicks: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        clicks: -1,
      },
    },
    {
      $limit: 5,
    },
    {
      $lookup: {
        from: "links",
        localField: "_id",
        foreignField: "_id",
        as: "link",
      },
    },
    {
      $unwind: "$link",
    },
    {
      $project: {
        _id: 0,
        clicks: 1,
        title: "$link.title",
        shortUrl: "$link.shortUrl",
        originalUrl: "$link.originalUrl",
      },
    },
  ]);

  return {
    topLinks,
  };
};
