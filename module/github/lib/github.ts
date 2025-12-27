import { Octokit } from "octokit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { string } from "zod";



/* 
*Getting the github Access Token
*
*/

export const getGithubToken = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        throw new Error("Unauthorized")
    }
    // We use find First may user can connected with multiple account
    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            providerId: "github"
        }
    });

    if (!account?.accessToken) {
        throw new Error("No github access token found")
    }

    return account.accessToken;
}


export async function fetchUserContribution(
    token: string,
    username: string
) {
    const octokit = new Octokit({ auth: token });

    const query = `
        query ($username: String!) {
        user(login: $username) {
            contributionCollection {
            contributionCalendar {
                totalContributions
                weeks {
                contributionDays {
                    contributionCount
                    date
                    color
                }
                }
            }
            }
        }
        }
    `;

    interface ContributionDay {
        contributionCount: number;
        date: string;
        color: string;
    }

    interface ContributionWeek {
        contributionDays: ContributionDay[];
    }

    interface ContributionResponse {
        user: {
            contributionCollection: {
                contributionCalendar: {
                    totalContributions: number;
                    weeks: ContributionWeek[];
                };
            };
        };
    }

    try {
        const response = await octokit.graphql<ContributionResponse>(query, {
            username,
        });

        return response.user.contributionCollection.contributionCalendar;
    } catch (error) {
        console.error("Failed to fetch contribution data:", error);
        throw error;
    }
}

