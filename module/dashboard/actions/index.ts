"use server";

import { fetchUserContribution, getGithubToken } from "@/module/github/lib/github";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import prisma from "@/lib/db";

/* =========================    
   DASHBOARD STATS
========================= */
export async function getDashboardStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    // Get authenticated GitHub user
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // TODO: Fetch Total Connected repos from DB
    const totalRepos = 30;

    const calendar = await fetchUserContribution(token, user.login);
    const totalCommits = calendar?.totalContributions ?? 0;

    // Count PRs
    const { data: prs } =
      await octokit.rest.search.issuesAndPullRequests({
        q: `author:${user.login} type:pr`,
        per_page: 1,
      });

    const totalPRs = prs.total_count;

    // TODO: Fetch real review count from DB
    const totalReviews = 44;

    return {
      totalCommits,
      totalPRs,
      totalReviews,
      totalRepos,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);

    return {
      totalCommits: 0,
      totalPRs: 0,
      totalReviews: 0,
      totalRepos: 0,
    };
  }
}

/* =========================
   MONTHLY ACTIVITY
========================= */
export async function getMonthlyActivity() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const token = await getGithubToken();
    const octokit = new Octokit({ auth: token });

    const { data: user } = await octokit.rest.users.getAuthenticated();
    const calendar = await fetchUserContribution(token, user.login);

    if (!calendar) {
      return [];
    }

    const monthlyData: Record<
      string,
      { commits: number; prs: number; reviews: number }
    > = {};

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyData[monthKey] = { commits: 0, prs: 0, reviews: 0 };
    }

    // Commits from contribution calendar
    calendar.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        const date = new Date(day.date);
        const monthKey = monthNames[date.getMonth()];

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].commits += day.contributionCount;
        }
      });
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // TODO: Replace with real review data from DB
    const generateSampleReviews = () => {
      const sampleReviews: { createdAt: Date }[] = [];
      const now = new Date();

      for (let i = 0; i < 45; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 180);
        const reviewDate = new Date(now);
        reviewDate.setDate(reviewDate.getDate() - randomDaysAgo);

        sampleReviews.push({ createdAt: reviewDate });
      }

      return sampleReviews;
    };

    const reviews = generateSampleReviews();
    reviews.forEach((review) => {
      const monthKey = monthNames[review.createdAt.getMonth()];
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].reviews += 1;
      }
    });

    // PRs from last 6 months
    const { data: prs } =
      await octokit.rest.search.issuesAndPullRequests({
        q: `author:${user.login} type:pr created:>${sixMonthsAgo
          .toISOString()
          .split("T")[0]}`,
        per_page: 100,
      });

    prs.items.forEach((pr) => {
      const date = new Date(pr.created_at);
      const monthKey = monthNames[date.getMonth()];

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].prs += 1;
      }
    });

    return Object.keys(monthlyData).map((name) => ({
      name,
      ...monthlyData[name],
    }));
  } catch (error) {
    console.error("Error fetching monthly activity:", error);
    return [];
  }
}
