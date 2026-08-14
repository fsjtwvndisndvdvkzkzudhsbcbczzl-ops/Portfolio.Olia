import importlib.util
from types import SimpleNamespace
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parent / "fine_dora.py"
SPEC = importlib.util.spec_from_file_location("fine_dora", MODULE_PATH)
assert SPEC is not None
assert SPEC.loader is not None
fine_dora = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(fine_dora)


class FineDoraFormattingTest(unittest.TestCase):
    def setUp(self):
        self.original_list_skills = getattr(fine_dora, "list_skills")
        self.original_list_llm_configs = getattr(fine_dora, "list_llm_configs")
        setattr(fine_dora, "list_skills", lambda refresh=False: [])
        setattr(fine_dora, "list_llm_configs", lambda refresh=False: [])

    def tearDown(self):
        setattr(fine_dora, "list_skills", self.original_list_skills)
        setattr(fine_dora, "list_llm_configs", self.original_list_llm_configs)

    def test_format_agent_summary_prefers_readable_fields(self):
        agent = {
            "id": "agent-uuid",
            "name": "Sales Agent",
            "description": "Answers sales questions",
            "published": True,
            "agentStatus": "PUBLISHED",
            "lastPublishTime": 1775460244,
            "publishToWorkspace": True,
            "publishToStandaloneUrl": False,
            "skillIds": ["skill-1"],
            "skills": [
                {
                    "id": "skill-1",
                    "name": "Revenue Skill",
                    "description": "Revenue analysis",
                    "skillType": "DATASET",
                }
            ],
        }

        result = fine_dora.format_agent_summary(agent)

        self.assertEqual(result["name"], "Sales Agent")
        self.assertTrue(result["published"])
        self.assertEqual(result["agentStatus"], "PUBLISHED")
        self.assertEqual(result["lastPublishTime"], 1775460244)
        self.assertTrue(result["publishToWorkspace"])
        self.assertFalse(result["publishToStandaloneUrl"])
        self.assertEqual(result["skillNames"], ["Revenue Skill"])
        self.assertEqual(result["id"], "agent-uuid")
        self.assertEqual(result["skillIds"], ["skill-1"])
        self.assertNotIn("id", result["skills"][0])

    def test_enrich_editable_agent_resolves_llm_and_skill_names(self):
        setattr(
            fine_dora,
            "list_skills",
            lambda refresh=False: [
                {
                    "id": "skill-1",
                    "name": "Revenue Skill",
                    "description": "Revenue analysis",
                    "skillType": "DATASET",
                }
            ],
        )
        setattr(
            fine_dora,
            "list_llm_configs",
            lambda refresh=False: [
                {
                    "id": "llm-1",
                    "name": "GPT Friendly",
                    "protocol": "openai",
                }
            ],
        )

        editable = {
            "id": "agent-1",
            "skillIds": ["skill-1"],
            "llmConfigId": "llm-1",
        }

        result = fine_dora.enrich_editable_agent(editable)

        self.assertEqual(result["skillNames"], ["Revenue Skill"])
        self.assertEqual(result["llmConfigName"], "GPT Friendly")
        self.assertEqual(result["readableSkills"][0]["name"], "Revenue Skill")


class FineDoraPayloadSanitizeTest(unittest.TestCase):
    def test_save_payload_keeps_skill_configs_and_binding_fields(self):
        payload, removed_keys = fine_dora.sanitize_agent_payload(
            {
                "id": "agent-1",
                "name": "Sales Agent",
                "description": "Answers sales questions",
                "skillConfigs": [{"id": "skill-template-1", "name": "Revenue Skill"}],
                "datasourceIds": ["ds-1"],
                "knowledgeSpaceIds": ["kb-1"],
                "skillNames": ["Revenue Skill"],
            },
            "save",
        )

        self.assertEqual(payload["skillConfigs"][0]["id"], "skill-template-1")
        self.assertEqual(payload["datasourceIds"], ["ds-1"])
        self.assertEqual(payload["knowledgeSpaceIds"], ["kb-1"])
        self.assertNotIn("skillNames", payload)
        self.assertEqual(removed_keys, ["skillNames"])

    def test_create_payload_does_not_synthesize_skill_ids_from_skills(self):
        payload, removed_keys = fine_dora.sanitize_agent_payload(
            {
                "name": "Sales Agent",
                "description": "Answers sales questions",
                "skills": ["skill-1", "skill-2"],
            },
            "create",
        )

        self.assertEqual(payload["skills"], ["skill-1", "skill-2"])
        self.assertNotIn("skillIds", payload)
        self.assertEqual(removed_keys, [])


class FineDoraChatAggregationTest(unittest.TestCase):
    def test_compact_history_uses_turns_shape(self):
        history = {
            "thread_id": "session-1",
            "turns": [
                {
                    "queryId": "q-1",
                    "query": "hello",
                    "status": "SUCCESS",
                    "answer": "world",
                }
            ],
        }

        result = fine_dora.compact_history(history)

        self.assertEqual(result[0]["queryId"], "q-1")
        self.assertEqual(result[0]["query"], "hello")
        self.assertEqual(result[0]["summary"], "world")
        self.assertEqual(result[0]["status"], "SUCCESS")

    def test_build_chat_result_from_history_turn_uses_answer(self):
        payload = {"externalSessionKey": "session-1", "queryId": "q-1"}
        turn = {
            "queryId": "q-1",
            "status": "SUCCESS",
            "answer": "world",
            "messageSummaries": [
                {"type": "RESULT", "status": "SUCCESS", "content": "world"}
            ],
        }

        result = fine_dora.build_chat_result_from_history_turn(payload, turn)

        self.assertEqual(result["queryId"], "q-1")
        self.assertEqual(result["content"], "world")
        self.assertEqual(result["status"], "SUCCESS")


class FineDoraLocalePropagationTest(unittest.TestCase):
    def test_build_chat_payload_should_include_requested_locale(self):
        args = self.create_chat_args("ja-JP")

        payload = fine_dora.build_chat_payload(args, "agent-1")

        self.assertEqual(payload["locale"], "ja-JP")

    def test_build_chat_payload_should_omit_locale_when_not_requested(self):
        args = self.create_chat_args(None)

        payload = fine_dora.build_chat_payload(args, "agent-1")

        self.assertNotIn("locale", payload)

    def test_build_worker_command_should_propagate_locale(self):
        payload = fine_dora.build_chat_payload(self.create_chat_args("ja-JP"), "agent-1")

        command = fine_dora.build_worker_command(SimpleNamespace(), "job-1", payload)

        locale_index = command.index("--locale")
        self.assertEqual(command[locale_index + 1], "ja-JP")

    def test_chat_parser_should_accept_optional_locale(self):
        args = fine_dora.build_parser().parse_args(
            [
                "chat",
                "--published-agent-id",
                "agent-1",
                "--question",
                "hello",
                "--locale",
                "ja-JP",
            ]
        )

        self.assertEqual(args.locale, "ja-JP")

    @staticmethod
    def create_chat_args(locale):
        return SimpleNamespace(
            published_agent_id="agent-1",
            question="hello",
            external_session_key="session-1",
            query_id="query-1",
            channel_type="feishu",
            trace_id="trace-1",
            locale=locale,
        )


class FineDoraAsyncWaitTest(unittest.TestCase):
    def setUp(self):
        self.original_cmd_chat_start = getattr(fine_dora, "cmd_chat_start")
        self.original_cmd_chat_result = getattr(fine_dora, "cmd_chat_result")
        self.original_sleep = getattr(fine_dora.time, "sleep")
        self.original_time = getattr(fine_dora.time, "time")

    def tearDown(self):
        setattr(fine_dora, "cmd_chat_start", self.original_cmd_chat_start)
        setattr(fine_dora, "cmd_chat_result", self.original_cmd_chat_result)
        setattr(fine_dora.time, "sleep", self.original_sleep)
        setattr(fine_dora.time, "time", self.original_time)

    def test_wait_for_chat_job_should_poll_until_ready(self):
        responses = iter(
            [
                {"jobId": "job-1", "status": "RUNNING", "ready": False, "result": None, "error": None},
                {"jobId": "job-1", "status": "RUNNING", "ready": False, "result": None, "error": None},
                {"jobId": "job-1", "status": "SUCCEEDED", "ready": True, "result": {"status": "SUCCESS"}, "error": None},
            ]
        )
        setattr(fine_dora, "cmd_chat_result", lambda args: next(responses))
        setattr(fine_dora.time, "sleep", lambda _: None)
        times = iter([0, 1, 2])
        setattr(fine_dora.time, "time", lambda: next(times))

        result = fine_dora.wait_for_chat_job("job-1", timeout_seconds=10, poll_interval_seconds=1)

        self.assertTrue(result["ready"])
        self.assertEqual(result["status"], "SUCCEEDED")

    def test_wait_for_chat_job_should_raise_on_timeout(self):
        setattr(
            fine_dora,
            "cmd_chat_result",
            lambda args: {"jobId": "job-1", "status": "RUNNING", "ready": False, "result": None, "error": None},
        )
        setattr(fine_dora.time, "sleep", lambda _: None)
        times = iter([0, 3, 6])
        setattr(fine_dora.time, "time", lambda: next(times))

        with self.assertRaises(RuntimeError) as error:
            fine_dora.wait_for_chat_job("job-1", timeout_seconds=5, poll_interval_seconds=1)

        self.assertIn("chat-wait timed out", str(error.exception))

    def test_cmd_chat_wait_should_start_and_wait(self):
        setattr(
            fine_dora,
            "cmd_chat_start",
            lambda args: {"jobId": "job-1", "status": "RUNNING", "publishedAgentId": "agent-1"},
        )
        responses = iter(
            [
                {"jobId": "job-1", "status": "RUNNING", "ready": False, "result": None, "error": None},
                {"jobId": "job-1", "status": "SUCCEEDED", "ready": True, "result": {"status": "SUCCESS"}, "error": None},
            ]
        )
        setattr(fine_dora, "cmd_chat_result", lambda args: next(responses))
        setattr(fine_dora.time, "sleep", lambda _: None)
        times = iter([0, 1])
        setattr(fine_dora.time, "time", lambda: next(times))

        args = SimpleNamespace(
            published_agent_id="agent-1",
            question="hello",
            external_session_key=None,
            query_id=None,
            channel_type="feishu",
            trace_id=None,
            timeout_seconds=10,
            poll_interval_seconds=1,
        )
        result = fine_dora.cmd_chat_wait(args)

        self.assertEqual(result["jobId"], "job-1")
        self.assertTrue(result["ready"])


if __name__ == "__main__":
    unittest.main()
